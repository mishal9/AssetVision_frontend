import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import { type UserInfoResponse } from '@/services/api';
import { plaidApi, PlaidInstitution } from '@/services/plaid-api';
import { PLAID_ENDPOINTS } from '@/config/api';
import { fetchWithAuth } from '@/services/api-utils';

/**
 * Linked account interface representing a connected brokerage account
 */
export interface LinkedAccount {
  id: string;
  institutionId: string;
  institutionName: string;
  accountName: string;
  accountMask: string;
  accountType: string;
  accessToken?: string;
  lastUpdated: Date;
  status: 'active' | 'error' | 'disconnected';
  balance?: {
    available: number;
    current: number;
  };
}

/**
 * User state interface
 */
interface UserState {
  isAuthenticated: boolean;
  user: {
    id?: number;
    username?: string;
    email?: string;
    avatar?: string;
  } | null;
  linkedAccounts: LinkedAccount[];
  accountsLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  linkedAccounts: [],
  accountsLoading: false,
  loading: false,
  error: null,
};

/**
 * Async thunk to fetch user information
 */
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      const userInfo = await authService.getUserInfo();
      return userInfo;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user info');
    }
  }
);

/**
 * Async thunk to fetch linked accounts
 */
/**
 * Fetch linked accounts from the backend
 */
export const fetchLinkedAccounts = createAsyncThunk(
  'user/fetchLinkedAccounts',
  async (_, { rejectWithValue }) => {
    try {
      // Using centralized API configuration and enhanced fetchWithAuth
      console.log('Fetching linked accounts from:', PLAID_ENDPOINTS.LINKED_ACCOUNTS);
      const data = await fetchWithAuth(PLAID_ENDPOINTS.LINKED_ACCOUNTS);
      
      console.log('Linked accounts response:', data);
      
      // Process accounts data to match our LinkedAccount interface
      const accounts = data.accounts || [];
      
      // Map backend response to our frontend model
      return accounts.map((account: any) => ({
        id: account.id || account.account_id || '',
        institutionId: account.institution_id || '',
        institutionName: account.institution_name || 'Unknown Institution',
        accountName: account.name || account.account_name || 'Account',
        accountMask: account.mask || account.account_mask || '****',
        accountType: account.type || account.account_type || 'unknown',
        accessToken: account.access_token,
        lastUpdated: account.last_updated ? new Date(account.last_updated) : new Date(),
        status: account.status || 'active',
        balance: {
          available: account.balances?.available || account.available_balance || 0,
          current: account.balances?.current || account.current_balance || 0
        }
      }));
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch linked accounts');
    }
  }
);

/**
 * Async thunk to link a new brokerage account
 */
/**
 * Link a new brokerage account with Plaid
 */
export const linkBrokerageAccount = createAsyncThunk(
  'user/linkBrokerageAccount',
  async ({ publicToken, metadata }: { publicToken: string, metadata: any }, { rejectWithValue, dispatch }) => {
    try {
      console.log('Linking brokerage account with publicToken and metadata:', { metadata });
      
      // Exchange the public token for an access token and store connection on backend
      const result = await plaidApi.exchangePublicToken(publicToken, metadata);
      
      if (!result.success) {
        throw new Error('Failed to exchange public token');
      }
      
      console.log('Token exchange successful:', result);
      
      // Handle multiple accounts if provided in metadata
      const accounts = Array.isArray(metadata.accounts) ? metadata.accounts : [metadata.accounts];
      
      if (!accounts.length) {
        throw new Error('No accounts found in Plaid metadata');
      }
      
      // Map Plaid accounts to our internal format
      const linkedAccounts = accounts.map((account: any) => {
        return {
          id: account.id,
          institutionId: metadata.institution.id,
          institutionName: metadata.institution.name,
          accountName: account.name,
          accountMask: account.mask,
          accountType: account.type || account.subtype || 'unknown',
          accessToken: result.accessToken, // Note: In production, this should only be stored on backend
          lastUpdated: new Date(),
          status: 'active',
          balance: {
            available: account.balances?.available || 0,
            current: account.balances?.current || 0
          },
          connectionId: result.connectionId || null // Store the backend connection ID
        } as LinkedAccount;
      });
      
      console.log('Created linked accounts:', linkedAccounts);
      
      // After linking, fetch all accounts to ensure we have the latest data from the backend
      // Increased timeout to give backend more time to process
      setTimeout(() => {
        console.log('Fetching updated linked accounts list after account linking');
        dispatch(fetchLinkedAccounts());
      }, 2000); // Increased from 1000ms to 2000ms
      
      // Return all linked accounts instead of just the first one
      return linkedAccounts;
    } catch (error) {
      console.error('Error linking account:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to link account');
    }
  }
);

/**
 * User slice
 */
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.linkedAccounts = [];
    },
    updateAccountStatus: (state, action) => {
      const { accountId, status } = action.payload;
      const account = state.linkedAccounts.find(acc => acc.id === accountId);
      if (account) {
        account.status = status;
        account.lastUpdated = new Date();
      }
    },
    removeLinkedAccount: (state, action) => {
      const accountId = action.payload;
      state.linkedAccounts = state.linkedAccounts.filter(acc => acc.id !== accountId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        
        // Extract user data from the response
        const userData = action.payload;
        
        if (userData && userData.user) {
          state.user = {
            id: userData.user.id,
            username: userData.user.username,
            email: userData.user.email,
            // Generate avatar from initials if no avatar URL is provided
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.username)}&background=random`,
          };
        }
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Handle linked accounts fetching
      .addCase(fetchLinkedAccounts.pending, (state) => {
        state.accountsLoading = true;
        state.error = null;
      })
      .addCase(fetchLinkedAccounts.fulfilled, (state, action) => {
        state.accountsLoading = false;
        // Ensure we have valid accounts data
        if (Array.isArray(action.payload)) {
          state.linkedAccounts = action.payload;
          console.log('Updated linkedAccounts in Redux store:', action.payload);
        } else {
          console.error('Invalid accounts data received:', action.payload);
        }
      })
      .addCase(fetchLinkedAccounts.rejected, (state, action) => {
        state.accountsLoading = false;
        state.error = action.payload as string;
      })
      // Handle linking a new account
      .addCase(linkBrokerageAccount.pending, (state) => {
        state.accountsLoading = true;
        state.error = null;
      })
      .addCase(linkBrokerageAccount.fulfilled, (state, action) => {
        state.accountsLoading = false;
        // Add the new linked account to the array if it doesn't already exist
        if (action.payload) {
          const existingIndex = state.linkedAccounts.findIndex(acc => acc.id === action.payload.id);
          if (existingIndex >= 0) {
            // Update existing account
            state.linkedAccounts[existingIndex] = action.payload;
            console.log('Updated existing account in Redux store:', action.payload);
          } else {
            // Add new account
            state.linkedAccounts.push(action.payload);
            console.log('Added new account to Redux store:', action.payload);
          }
        }
      })
      .addCase(linkBrokerageAccount.rejected, (state, action) => {
        state.accountsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, updateAccountStatus, removeLinkedAccount } = userSlice.actions;
export default userSlice.reducer;
