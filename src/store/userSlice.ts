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
    firstName?: string;
    lastName?: string;
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
      const data = await fetchWithAuth(PLAID_ENDPOINTS.LINKED_ACCOUNTS, {}, 30000);
      
      // Handle different response structures
      let accountsToProcess = [];
      
      if (Array.isArray(data)) {
        // Direct array response
        accountsToProcess = data;
        console.log('Processing array response with', data.length, 'accounts');
      } else if (data && typeof data === 'object') {
        // Use type assertion to access properties on the object
        const dataObj = data as Record<string, unknown>;
        
        if (dataObj.accounts && Array.isArray(dataObj.accounts)) {
          // Object with accounts array
          accountsToProcess = dataObj.accounts;
        } else if (dataObj.connections && Array.isArray(dataObj.connections)) {
          // Object with connections array
          accountsToProcess = dataObj.connections;
        } else if (dataObj.data && Array.isArray(dataObj.data)) {
          // Object with data array (common API pattern)
          accountsToProcess = dataObj.data;
          console.log('Processing object.data with', dataObj.data.length, 'accounts');
        } else {
          // Try to extract any array property
          const arrayProps = Object.entries(dataObj)
            .filter(([, value]) => Array.isArray(value))
            .map(([key, value]) => ({ key, length: (value as any[]).length }));
          
          console.log('Found array properties:', arrayProps);
          
          if (arrayProps.length > 0) {
            // Use the longest array property
            const longestArrayProp = arrayProps.reduce((prev, current) => 
              prev.length > current.length ? prev : current);
            
            accountsToProcess = dataObj[longestArrayProp.key] as any[];
            console.log(`Using longest array property '${longestArrayProp.key}' with ${longestArrayProp.length} items`);
          } else {
            console.log('No array properties found in response');
          }
        }
      }
      

      
      if (!accountsToProcess.length) {
        throw new Error('No accounts found in API response');
      }
      
      // Map backend response to our frontend model
      return accountsToProcess.map((account: any, index: number) => {
        const id = account.id ?? account.account_id;
        if (!id) {
          throw new Error(`Account at index ${index} is missing required field: id or account_id`);
        }
        
        // Check for institution_id in both snake_case and camelCase
        const institutionId = account.institution_id ?? account.institutionId;
        if (!institutionId) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: institution_id or institutionId. Account data: ${JSON.stringify(account)}`);
        }
        
        // Check for institution_name in both snake_case and camelCase
        const institutionName = account.institution_name ?? account.institutionName;
        if (!institutionName) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: institution_name or institutionName`);
        }
        
        const accountName = account.name ?? account.account_name ?? account.accountName;
        if (!accountName) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: name, account_name, or accountName`);
        }
        
        const accountType = account.type ?? account.account_type ?? account.accountType;
        if (!accountType) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: type, account_type, or accountType`);
        }
        
        const lastUpdated = account.last_updated ?? account.lastUpdated;
        if (!lastUpdated) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: last_updated or lastUpdated`);
        }
        
        if (!account.status) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: status`);
        }
        
        const availableBalance = account.balances?.available ?? account.available_balance ?? account.availableBalance;
        if (availableBalance === null || availableBalance === undefined) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: balances.available, available_balance, or availableBalance`);
        }
        
        const currentBalance = account.balances?.current ?? account.current_balance ?? account.currentBalance;
        if (currentBalance === null || currentBalance === undefined) {
          throw new Error(`Account ${id} (index ${index}) is missing required field: balances.current, current_balance, or currentBalance`);
        }
        
        return {
          id,
          institutionId: institutionId,
          institutionName: institutionName,
          accountName: accountName,
          accountMask: account.mask ?? account.account_mask ?? account.accountMask ?? '****',
          accountType: accountType,
          connectionId: account.connection_id ?? account.connectionId,
          lastUpdated: new Date(lastUpdated).toISOString(),
          status: account.status,
          balance: {
            available: availableBalance,
            current: currentBalance
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
        if (!account.id) {
          throw new Error('Account ID is required');
        }
        if (!metadata.institution?.id) {
          throw new Error('Institution ID is required');
        }
        if (!metadata.institution?.name) {
          throw new Error('Institution name is required');
        }
        if (!account.name) {
          throw new Error('Account name is required');
        }
        const accountType = account.type ?? account.subtype;
        if (!accountType) {
          throw new Error('Account type is required');
        }
        if (!result.connectionId) {
          throw new Error('Connection ID is required');
        }
        const availableBalance = account.balances?.available;
        if (availableBalance === null || availableBalance === undefined) {
          throw new Error('Available balance is required');
        }
        const currentBalance = account.balances?.current;
        if (currentBalance === null || currentBalance === undefined) {
          throw new Error('Current balance is required');
        }
        
        return {
          id: account.id,
          institutionId: metadata.institution.id,
          institutionName: metadata.institution.name,
          accountName: account.name,
          accountMask: account.mask,
          accountType: accountType,
          connectionId: result.connectionId,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          balance: {
            available: availableBalance,
            current: currentBalance
          }
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
        const responseData = action.payload as any;
        
        // Handle the actual API response structure: { authenticated: true, user: {...} }
        const userData = responseData.user || responseData;
        
        if (userData) {
          // Parse the username to extract first and last name if it contains a full name
          const nameParts = userData.username ? userData.username.split(' ') : [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          state.user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            firstName: firstName,
            lastName: lastName,
            // Generate avatar from initials if no avatar URL is provided
            avatar: userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username || 'User')}&background=random`,
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
