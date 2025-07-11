import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
// import { type UserInfoResponse } from '@/services/api';
import { plaidApi } from '@/services/plaid-api';
import { PLAID_ENDPOINTS } from '@/config/api';
import { fetchWithAuth } from '@/services/api-utils';

/**
 * Linked account interface representing a connected brokerage account
 */
export interface LinkedAccount {
  id: string;
  institutionId: string;
  institutionName: string;
  institutionLogoUrl?: string;
  accountName: string;
  accountMask: string;
  accountType: string;
  connectionId?: string;
  lastUpdated: string;
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
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      
      if (typeof data === 'object' && data !== null) {
        console.log('Keys:', Object.keys(data));
      }
      
      // Handle different response structures
      let accountsToProcess = [];
      
      if (Array.isArray(data)) {
        // Direct array response
        accountsToProcess = data;
        console.log('Processing array response with', data.length, 'accounts');
      } else if (data && typeof data === 'object') {
        if (data.accounts && Array.isArray(data.accounts)) {
          // Object with accounts array
          accountsToProcess = data.accounts;
          console.log('Processing object.accounts with', data.accounts.length, 'accounts');
        } else if (data.connections && Array.isArray(data.connections)) {
          // Object with connections array
          accountsToProcess = data.connections;
          console.log('Processing object.connections with', data.connections.length, 'accounts');
        } else if (data.data && Array.isArray(data.data)) {
          // Object with data array (common API pattern)
          accountsToProcess = data.data;
          console.log('Processing object.data with', data.data.length, 'accounts');
        } else {
          // Try to extract any array property
          const arrayProps = Object.entries(data)
            .filter(([_, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, length: (value as any[]).length }));
          
          console.log('Found array properties:', arrayProps);
          
          if (arrayProps.length > 0) {
            // Use the longest array property
            const longestArrayProp = arrayProps.reduce((prev, current) => 
              prev.length > current.length ? prev : current);
            
            accountsToProcess = data[longestArrayProp.key] as any[];
            console.log(`Using longest array property '${longestArrayProp.key}' with ${longestArrayProp.length} items`);
          } else {
            console.log('No array properties found in response');
          }
        }
      }
      
      console.log('Final accounts to process:', accountsToProcess);
      
      if (!accountsToProcess.length) {
        console.warn('No accounts found in API response');
        return [];
      }
      
      // Map backend response to our frontend model
      return accountsToProcess.map((account: any) => {
        console.log('Processing account:', account);
        return {
          id: account.id || account.account_id || '',
          institutionId: account.institution_id || '',
          institutionName: account.institution_name || 'Unknown Institution',
          accountName: account.name || account.account_name || 'Account',
          accountMask: account.mask || account.account_mask || '****',
          accountType: account.type || account.account_type || 'unknown',
          connectionId: account.connection_id || account.connectionId,
          lastUpdated: account.last_updated ? new Date(account.last_updated).toISOString() : new Date().toISOString(),
          status: account.status || 'active',
          balance: {
            available: account.balances?.available || account.available_balance || 0,
            current: account.balances?.current || account.current_balance || 0
          }
        };
      });
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
      // Exchange the public token for an access token and store connection on backend
      const result = await plaidApi.exchangePublicToken(publicToken, metadata);
      
      if (!result.success) {
        throw new Error('Failed to exchange public token');
      }
      
      console.log('Account successfully linked with institution:', result.institutionName);
    
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
          connectionId: result.connectionId,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          balance: {
            available: account.balances?.available || 0,
            current: account.balances?.current || 0
          },
          connectionId: result.connectionId || null // Store the backend connection ID
        } as LinkedAccount;
      });
      
      // After linking, fetch all accounts to ensure we have the latest data from the backend
      // Increased timeout to give backend more time to process
      setTimeout(() => {
        dispatch(fetchLinkedAccounts());
      }, 2000); // Increased from 1000ms to 2000ms
      
      // Return all linked accounts
      return linkedAccounts;
    } catch (error) {
      // Don't duplicate the error log - fetchWithAuth already logs it
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
        account.lastUpdated = new Date().toISOString();
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
