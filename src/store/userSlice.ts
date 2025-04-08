import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import { type UserInfoResponse } from '@/services/api';
import { plaidApi, PlaidInstitution } from '@/services/plaid-api';
import { PLAID_ENDPOINTS } from '@/config/api';

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
export const fetchLinkedAccounts = createAsyncThunk(
  'user/fetchLinkedAccounts',
  async (_, { rejectWithValue }) => {
    try {
      // Using centralized API configuration
      const response = await fetch(PLAID_ENDPOINTS.LINKED_ACCOUNTS, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch linked accounts');
      }
      
      const data = await response.json();
      return data.accounts;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch linked accounts');
    }
  }
);

/**
 * Async thunk to link a new brokerage account
 */
export const linkBrokerageAccount = createAsyncThunk(
  'user/linkBrokerageAccount',
  async ({ publicToken, metadata }: { publicToken: string, metadata: any }, { rejectWithValue }) => {
    try {
      const result = await plaidApi.exchangePublicToken(publicToken);
      
      if (!result.success) {
        throw new Error('Failed to exchange public token');
      }
      
      // Create a new linked account object
      const linkedAccount: LinkedAccount = {
        id: metadata.accounts[0].id,
        institutionId: metadata.institution.id,
        institutionName: metadata.institution.name,
        accountName: metadata.accounts[0].name,
        accountMask: metadata.accounts[0].mask,
        accountType: metadata.accounts[0].type,
        accessToken: result.accessToken, // Note: In production, this should only be stored on backend
        lastUpdated: new Date(),
        status: 'active',
        balance: {
          available: metadata.accounts[0].balances?.available || 0,
          current: metadata.accounts[0].balances?.current || 0
        }
      };
      
      // In a real implementation, you would save this linked account to your backend
      // For now, we'll just return it to be added to the Redux store
      return linkedAccount;
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
        state.linkedAccounts = action.payload;
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
        // Add the new linked account to the array
        state.linkedAccounts.push(action.payload);
      })
      .addCase(linkBrokerageAccount.rejected, (state, action) => {
        state.accountsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, updateAccountStatus, removeLinkedAccount } = userSlice.actions;
export default userSlice.reducer;
