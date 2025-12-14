/**
 * Plaid API service for AlphaOptimize
 * Handles all Plaid-related API requests to the Django backend
 */

import { fetchWithAuth } from './api-utils';
import { HoldingInput } from '@/types/portfolio';
import { PLAID_ENDPOINTS } from '@/config/api';

// No mock data - API must provide real data

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  balances: {
    available: number;
    current: number;
    limit?: number;
  };
}

export interface PlaidInstitution {
  id: string;
  name: string;
}

export interface PlaidLinkSuccess {
  publicToken: string;
  metadata: {
    institution: PlaidInstitution;
    accounts: PlaidAccount[];
  };
}

/**
 * Plaid API methods
 */
export const plaidApi = {
  /**
   * Create a Plaid Link token
   * Calls the Django backend to generate a link token for Plaid Link initialization
   * @param userId User ID to associate with the link token (optional, defaults to logged-in user from JWT)
   * @param forUpdate Whether this is for updating an existing account (true) or creating a new one (false)
   * @param accountId Optional account ID if updating an existing account
   */
  createLinkToken: async (userId?: string, forUpdate: boolean = false, accountId?: string): Promise<string> => {
    // Only use provided userId if explicitly passed
    let authenticatedUserId = userId;
    
    // If no userId provided, extract from JWT token
    if (!authenticatedUserId) {
      try {
        // Get auth token from cookies
        const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
        const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
        const token = tokenCookie ? tokenCookie.split('=')[1] : null;
        
        if (token) {
          try {
            // Define interface for decoded JWT payload
            interface DecodedToken {
              username?: string;
              sub?: string;
              userId?: string;
              [key: string]: unknown;
            }
            
            // Import jwt-decode v4 using the correct export pattern
            const { jwtDecode } = await import('jwt-decode');
            const decoded = jwtDecode<DecodedToken>(token);
            
            // Look for user ID in common JWT claim locations
            authenticatedUserId = decoded.username || decoded.sub || decoded.userId as string;
          } catch (decodeError) {
            console.error('Failed to decode JWT token:', decodeError);
          }
        }
      } catch (error) {
        console.error('Error extracting user ID from JWT:', error);
      }
    }
    try {
      const response = await fetchWithAuth(PLAID_ENDPOINTS.CREATE_LINK_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          user_id: authenticatedUserId,
          update_mode: forUpdate,
          account_id: accountId
        }),
      }, 30000);
      
      // Type assertion for response
      const typedResponse = response as Record<string, unknown>;
      
      if (!typedResponse.link_token) {
        throw new Error('Failed to get link token from server');
      }
      
      return typedResponse.link_token as string;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  },
  
  /**
   * Exchange public token for access token
   * Calls the Django backend to exchange the public token for an access token
   * Supports multiple linked institutions
   */
  exchangePublicToken: async (publicToken: string, metadata:any) => {
    // Check for required parameters
    if (!publicToken) {
      throw new Error('Missing public token');
    }
    
    // Validate metadata
    if (!metadata) {
      throw new Error('Missing metadata');
    }
    
    // Prepare the request data with all necessary information for the backend
    if (!metadata?.institution?.id) {
      throw new Error('Institution ID is required in metadata');
    }
    if (!metadata?.institution?.name) {
      throw new Error('Institution name is required in metadata');
    }
    if (!metadata?.accounts || !Array.isArray(metadata.accounts)) {
      throw new Error('Accounts array is required in metadata');
    }
    
    const requestData = {
      public_token: publicToken,
      metadata: metadata, // Add metadata from Plaid link
      institution_id: metadata.institution.id,
      institution_name: metadata.institution.name,
      // Include account details for more reliable backend storage
      accounts: metadata.accounts
    };
    
    try {
      // Make sure to set credentials: 'include' to send cookies with the request
      const response = await fetchWithAuth(PLAID_ENDPOINTS.EXCHANGE_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include' // Ensure cookies are sent with request
      }, 30000);
      
      // Type assertion for response
      const typedResponse = response as Record<string, unknown>;
      
      if (!typedResponse.success) {
        const errorMessage = typeof typedResponse.message === 'string' ? 
          typedResponse.message : 'Failed to store connection on server';
        throw new Error(errorMessage);
      }
      
      if (!typedResponse.connection_id) {
        throw new Error('No connection ID received from server');
      }
      
      // Retrieve existing connections or initialize empty object
      const storedConnections = sessionStorage.getItem('plaid_connections');
      if (!storedConnections) {
        throw new Error('Session storage for plaid_connections not initialized');
      }
      const existingConnections = JSON.parse(storedConnections);
      
      // Add new connection with institution ID as key
      if (!metadata?.institution?.id) {
        throw new Error('Institution ID is required');
      }
      if (!metadata?.institution?.name) {
        throw new Error('Institution name is required');
      }
      if (!metadata?.accounts || !Array.isArray(metadata.accounts)) {
        throw new Error('Accounts array is required');
      }
      if (!typedResponse.account_ids || !Array.isArray(typedResponse.account_ids)) {
        throw new Error('Account IDs are required in response');
      }
      
      const institutionId = metadata.institution.id;
      existingConnections[institutionId] = {
        connectionId: typedResponse.connection_id as string,
        institutionName: metadata.institution.name,
        accounts: metadata.accounts,
        lastUpdated: new Date().toISOString()
      };
      
      // Save back to session storage
      sessionStorage.setItem('plaid_connections', JSON.stringify(existingConnections));
      
      const result = { 
        success: true, 
        institutionId: institutionId,
        institutionName: metadata.institution.name,
        connectionId: typedResponse.connection_id as string,
        accountIds: typedResponse.account_ids as string[]
      };
      
      return result;
    } catch (error) {
      // Only log once at this level, don't duplicate the error logs
      // The error will be logged by fetchWithAuth and passed up the chain
      throw error;
    }
  },
  
  /**
   * Get investment holdings from Plaid
   * Calls the Django backend to fetch investment holdings using the stored access token
   * @param accessToken Optional access token to use for a specific account. If not provided, uses the one from session storage.
   * @param institutionId Optional institution ID to fetch holdings for a specific institution.
   */
  getInvestmentHoldings: async (connectionId?: string, institutionId?: string): Promise<HoldingInput[]> => {
    let connection_id = connectionId;
    
    // If no connection ID provided, try to get it from session storage
    if (!connection_id && institutionId) {
      // Use institutionId to get a specific connection
      const storedConnections = sessionStorage.getItem('plaid_connections');
      if (!storedConnections) {
        throw new Error('Session storage for plaid_connections not initialized');
      }
      const existingConnections = JSON.parse(storedConnections);
      const institutionData = existingConnections[institutionId];
      if (!institutionData || !institutionData.connectionId) {
        throw new Error(`Connection ID not found for institution: ${institutionId}`);
      }
      connection_id = institutionData.connectionId;
    }
    
    if (!connection_id) {
      throw new Error('No connection ID available to fetch holdings');
    }
    
    const response = await fetchWithAuth(PLAID_ENDPOINTS.GET_HOLDINGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        connection_id: connection_id
      }),
    }, 30000);
    
    // Type assertion for response
    interface PlaidHoldingsResponse {
      holdings?: any[];
      securities?: any[];
    }
    
    const typedResponse = response as PlaidHoldingsResponse;
    
    // Check for the complete structure returned by Django
    if (!typedResponse.holdings || !Array.isArray(typedResponse.holdings)) {
      throw new Error('Invalid holdings data format received from server');
    }
    
    if (typedResponse.holdings.length === 0) {
      console.warn('No holdings returned from server for connectionId:', connectionId);
      return [];
    }
    
    // Map the holdings to the expected format
    return typedResponse.holdings.map((holding: any, index: number) => {
      // Find the corresponding security to get the symbol
      const security = typedResponse.securities?.find(
        (s: any) => s.security_id === holding.security_id
      );
      

      
      // Convert quantity to string for the form
      const quantity = holding.quantity ?? holding.shares;
      if (quantity == null) {
        throw new Error('Holding quantity/shares is required');
      }
      const sharesValue = String(quantity);
      
      const symbol = security?.ticker_symbol ?? holding.symbol;
      if (!symbol) {
        throw new Error('Symbol is required for holding');
      }
      
      // purchase_price is the average cost per share (calculated in backend)
      // cost_basis is the total cost basis
      const purchasePrice = holding.purchase_price;
      if (purchasePrice == null) {
        throw new Error('Purchase price is required for holding');
      }
      
      if (!holding.purchase_date && !holding.purchaseDate) {
        throw new Error(`Purchase date is required for holding ${symbol || 'unknown'} at index ${index}. Holding data: ${JSON.stringify(holding)}`);
      }
      
      const assetClass = security?.type ?? holding.asset_class;
      if (!assetClass) {
        throw new Error('Asset class is required for holding');
      }
      
      return {
        symbol,
        shares: sharesValue,
        purchasePrice,
        purchaseDate: holding.purchase_date ?? holding.purchaseDate,
        assetClass,
        // Include cost_basis for total value calculation
        costBasis: holding.cost_basis
      };
    });
  },
  
  /**
   * Create a portfolio from Plaid data
   * Fetches holdings from Plaid and creates a portfolio using the API
   * @param accessToken Optional access token for specific account. If not provided, uses the one from session storage.
   * @param portfolioName Optional name for the portfolio. If not provided, will use a default name.
   * @param institutionId Optional institution ID to create portfolio from a specific institution.
   */
  createPortfolioFromPlaid: async (connectionId?: string, portfolioName?: string, institutionId?: string) => {
    try {
      // Get holdings from Plaid API
      const holdings = await plaidApi.getInvestmentHoldings(connectionId, institutionId);
      
      if (!holdings || holdings.length === 0) {
        throw new Error('No holdings data available from Plaid');
      }
      
      // Create portfolio with the holdings
      if (!portfolioName) {
        throw new Error('Portfolio name is required');
      }
      return fetchWithAuth<void>(PLAID_ENDPOINTS.CREATE_PORTFOLIO, {
        method: 'POST',
        body: JSON.stringify({ 
          holdings,
          name: portfolioName
        }),
      }, 30000);
    } catch (error) {
      console.error('Error creating portfolio from Plaid:', error);
      throw error;
    }
  },
  
  /**
   * Get all linked accounts for the current user
   * Returns both local session storage accounts and accounts from the backend
   */
  getLinkedAccounts: async () => {
    try {
      // Get accounts from backend
      console.log('Calling list-connections endpoint:', PLAID_ENDPOINTS.LINKED_ACCOUNTS);
      const response = await fetchWithAuth(PLAID_ENDPOINTS.LINKED_ACCOUNTS, {}, 30000);
      
      console.log('Plaid API - Raw response from list-connections:', response);
      console.log('Plaid API - Response type:', typeof response);
      console.log('Plaid API - Is array?', Array.isArray(response));
      
      if (typeof response === 'object' && response !== null) {
        console.log('Plaid API - Response keys:', Object.keys(response));
      }
      
      // Check response structure
      // Define a type for the response object with possible structures
      interface PlaidResponse {
        accounts?: any[];
        connections?: any[];
        data?: any[];
        [key: string]: any;
      }

      let backendAccounts: any[] = [];
      // Type assertion for response
      const typedResponse = response as PlaidResponse;
      
      if (typedResponse.accounts && Array.isArray(typedResponse.accounts)) {
        console.log('Plaid API - Found accounts property with', typedResponse.accounts.length, 'items');
        backendAccounts = typedResponse.accounts;
      } else if (typedResponse.connections && Array.isArray(typedResponse.connections)) {
        console.log('Plaid API - Found connections property with', typedResponse.connections.length, 'items');
        backendAccounts = typedResponse.connections;
      } else if (typedResponse.data && Array.isArray(typedResponse.data)) {
        console.log('Plaid API - Found data property with', typedResponse.data.length, 'items');
        backendAccounts = typedResponse.data;
      } else if (Array.isArray(typedResponse)) {
        // Handle case where response is the array directly
        console.log('Plaid API - Response is direct array with', typedResponse.length, 'items');
        backendAccounts = typedResponse;
      } else {
        // Try to find any array property
        const arrayProps = Object.entries(typedResponse || {})
          .filter(([_, value]) => Array.isArray(value))
          .map(([key, value]) => ({ key, length: (value as any[]).length }));
        
        console.log('Plaid API - Found array properties:', arrayProps);
        
        if (arrayProps.length > 0) {
          // Use the longest array property
          const longestArrayProp = arrayProps.reduce((prev, current) => 
            prev.length > current.length ? prev : current);
          
          backendAccounts = typedResponse[longestArrayProp.key] as any[];
          console.log(`Plaid API - Using longest array property '${longestArrayProp.key}' with ${longestArrayProp.length} items`);
        } else {
          // Unexpected response structure
          console.warn('Plaid API - Unexpected response structure for linked accounts');
        }
      }
      
      // Get local accounts from session storage
      const storedConnections = sessionStorage.getItem('plaid_connections');
      if (!storedConnections) {
        throw new Error('Session storage for plaid_connections not initialized');
      }
      const localConnections = JSON.parse(storedConnections);
      const localAccounts = Object.entries(localConnections).map(([institutionId, data]: [string, any]) => {
        if (!data.connectionId) {
          throw new Error(`Connection ID missing for institution: ${institutionId}`);
        }
        if (!data.institutionName) {
          throw new Error(`Institution name missing for institution: ${institutionId}`);
        }
        if (!data.accounts || !Array.isArray(data.accounts)) {
          throw new Error(`Accounts missing or invalid for institution: ${institutionId}`);
        }
        if (!data.lastUpdated) {
          throw new Error(`Last updated missing for institution: ${institutionId}`);
        }
        return {
          id: data.connectionId,
          institution_id: institutionId,
          institution_name: data.institutionName,
          accounts: data.accounts,
          last_updated: data.lastUpdated,
          status: 'active', // Assume active for session storage accounts
          source: 'local' // Mark as local to differentiate
        };
      });
      
      // Merge accounts (prefer backend accounts if they exist)
      const mergedAccounts = [...localAccounts];
      
      // Define types for the account objects
      interface AccountData {
        institution_id: string;
        institution_name?: string;
        [key: string]: any; // Allow other properties
      }
      
      interface MergedAccount {
        id: any;
        institution_id: string;
        institution_name: any;
        accounts: any;
        last_updated: any;
        status: string;
        source: string;
      }
      
      // Add backend accounts that aren't in local storage
      backendAccounts.forEach((backendAccount: AccountData) => {
        if (!backendAccount.institution_id) {
          throw new Error('Institution ID is required for backend account');
        }
        if (!backendAccount.institution_name) {
          throw new Error('Institution name is required for backend account');
        }
        if (!backendAccount.accounts || !Array.isArray(backendAccount.accounts)) {
          throw new Error('Accounts array is required for backend account');
        }
        if (!backendAccount.last_updated) {
          throw new Error('Last updated is required for backend account');
        }
        if (!backendAccount.status) {
          throw new Error('Status is required for backend account');
        }
        
        const accountId = backendAccount.id ?? backendAccount.connection_id;
        if (!accountId) {
          throw new Error('Account ID or connection ID is required for backend account');
        }
        
        const localIndex = mergedAccounts.findIndex(local => 
          local.institution_id === backendAccount.institution_id);
          
        if (localIndex >= 0) {
          // Replace local with backend version
          mergedAccounts[localIndex] = { 
            ...backendAccount, 
            id: accountId,
            institution_name: backendAccount.institution_name,
            accounts: backendAccount.accounts,
            last_updated: backendAccount.last_updated,
            status: backendAccount.status,
            source: 'backend'
          } as MergedAccount;
        } else {
          // Add new backend account
          mergedAccounts.push({ 
            ...backendAccount, 
            id: accountId,
            institution_name: backendAccount.institution_name,
            accounts: backendAccount.accounts,
            last_updated: backendAccount.last_updated,
            status: backendAccount.status,
            source: 'backend'
          } as MergedAccount);
        }
      });
      
      return mergedAccounts;
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      throw error;
    }
  },
  
  /**
   * Disconnect a linked account
   * @param accountId The ID of the account to disconnect
   */
  disconnectAccount: async (accountId: string) => {
    try {
      await fetchWithAuth(PLAID_ENDPOINTS.DISCONNECT_ACCOUNT(accountId), {
        method: 'POST',
        body: JSON.stringify({ account_id: accountId }),
      }, 30000);
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting account:', error);
      throw error;
    }
  },
  
  /**
   * Update account connection if it's broken or requires re-authentication
   * @param accountId The ID of the account to update
   * @param institutionId Optional institution ID for the account
   */
  updateAccountConnection: async (accountId: string, institutionId?: string) => {
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    // First get a link token for update mode
    // Note: userId should be provided by the caller or extracted from auth context
    const linkToken = await plaidApi.createLinkToken(undefined, true, accountId);
    return { success: true, linkToken, institutionId };
  },
  
  /**
   * Get all linked institutions with their accounts
   * Returns a grouped view of institutions and their accounts
   */
  getLinkedInstitutions: async () => {
    try {
      const accounts = await plaidApi.getLinkedAccounts();
      
      // Define institution interface
      interface Institution {
        id: string;
        name: string;
        accounts: any[];
        lastUpdated: string;
        status: string;
        source: string;
      }

      // Group by institution
      const institutions = accounts.reduce<Record<string, Institution>>((acc, account) => {
        const institutionId = account.institution_id;
        
        if (!acc[institutionId]) {
          acc[institutionId] = {
            id: institutionId,
            name: account.institution_name,
            accounts: [],
            lastUpdated: account.last_updated,
            status: account.status,
            source: account.source
          };
        }
        
        // Add this account to the institution
        if (Array.isArray(account.accounts)) {
          acc[institutionId].accounts.push(...account.accounts);
        }
        
        return acc;
      }, {});
      
      return Object.values(institutions);
    } catch (error) {
      console.error('Error getting linked institutions:', error);
      throw error;
    }
  },
};
