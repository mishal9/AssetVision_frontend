/**
 * Plaid API service for Asset Vision
 * Handles all Plaid-related API requests to the Django backend
 */

import { fetchWithAuth } from './api-utils';
import { HoldingInput } from './api';
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
        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          try {
            // Import jwt-decode v4 using the correct export pattern
            const { jwtDecode } = await import('jwt-decode');
            const decoded = jwtDecode(token);
            
            // Look for user ID in common JWT claim locations
            authenticatedUserId = decoded.username;
 
            if (authenticatedUserId) {
              console.log('Extracted user ID from JWT:', authenticatedUserId);
            }
          } catch (decodeError) {
            console.error('Failed to decode JWT token:', decodeError);
          }
        }
      } catch (error) {
        console.error('Error extracting user ID from JWT:', error);
      }
    }
    
    if (!authenticatedUserId) {
      console.warn('No user ID available for Plaid Link token creation');
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
      });
      
      if (!response.link_token) {
        throw new Error('No link token received from server');
      }
      
      return response.link_token;
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
    console.log('Attempting to exchange public token...', { publicToken, metadata });
    
    // Prepare the request data with all necessary information for the backend
    const requestData = {
      public_token: publicToken,
      metadata: metadata, // Add metadata from Plaid link
      institution_id: metadata?.institution?.id,
      institution_name: metadata?.institution?.name,
      // Include account details for more reliable backend storage
      accounts: metadata?.accounts || []
    };
    
    console.log('Exchange token request data:', requestData);
    
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
      });
      
      console.log('Exchange token response:', response);
      
      if (!response.access_token) {
        console.error('No access_token in response:', response);
        throw new Error('No access token received from server');
      }
      
      if (!response.success) {
        console.error('Server indicated failure:', response);
        throw new Error(response.message || 'Failed to store connection on server');
      }
      
      console.log('Successfully exchanged token and saved on server');
      
      // Retrieve existing linked accounts or initialize empty object
      const existingTokens = JSON.parse(sessionStorage.getItem('plaid_access_tokens') || '{}');
      
      // Add new token with institution ID as key
      const institutionId = metadata?.institution?.id || 'unknown_institution';
      existingTokens[institutionId] = {
        accessToken: response.access_token,
        itemId: response.item_id,
        institutionName: metadata?.institution?.name || 'Unknown Institution',
        accounts: metadata?.accounts || [],
        lastUpdated: new Date().toISOString(),
        connectionId: response.connection_id || response.id || null // Save server-side connection ID
      };
      
      console.log('Saving token to session storage:', { institutionId, token: response.access_token });
      
      // Save back to session storage
      sessionStorage.setItem('plaid_access_tokens', JSON.stringify(existingTokens));
      
      // For backward compatibility
      sessionStorage.setItem('plaid_access_token', response.access_token);
      
      const result = { 
        success: true, 
        accessToken: response.access_token,
        itemId: response.item_id,
        institutionId: institutionId,
        institutionName: metadata?.institution?.name || 'Unknown Institution',
        connectionId: response.connection_id || response.id || null,
        accountIds: response.account_ids || []
      };
      
      console.log('Exchange token result:', result);
      return result;
    } catch (error) {
      console.error('Error in exchangePublicToken:', error);
      throw error;
    }
  },
  
  /**
   * Get investment holdings from Plaid
   * Calls the Django backend to fetch investment holdings using the stored access token
   * @param accessToken Optional access token to use for a specific account. If not provided, uses the one from session storage.
   * @param institutionId Optional institution ID to fetch holdings for a specific institution.
   */
  getInvestmentHoldings: async (accessToken?: string, institutionId?: string): Promise<HoldingInput[]> => {
    let token = accessToken;
    
    // If no token provided, check if we need to retrieve by institution ID
    if (!token && institutionId) {
      const tokenData = JSON.parse(sessionStorage.getItem('plaid_access_tokens') || '{}');
      if (tokenData[institutionId]) {
        token = tokenData[institutionId].accessToken;
      }
    }
    
    // Fallback to legacy storage if no token found
    if (!token) {
      token = sessionStorage.getItem('plaid_access_token');
    }
    
    if (!token) {
      throw new Error('No Plaid access token available');
    }
    
    console.log('Attempting to fetch holdings from API...');
    const response = await fetchWithAuth(PLAID_ENDPOINTS.GET_HOLDINGS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ 
        access_token: token,
        metadata: {
          institution: response.institution,
          accounts: response.accounts
        }
      }),
    });
    
    // Log the response structure to help debug
    console.log('Response structure:', Object.keys(response));
    
    // Check for the complete structure returned by Django
    if (!response.holdings || !Array.isArray(response.holdings)) {
      throw new Error('Invalid holdings data format received from server');
    }
    
    // Also log the securities to help with debugging
    if (response.securities) {
      console.log(`Found ${response.securities.length} securities`);
    }
    
    console.log('Successfully fetched holdings from API');
    // Full response dump for debugging
    console.log('Full response:', JSON.stringify(response, null, 2));
    
    if (response.holdings.length > 0) {
      // Sample holding object structure
      console.log('Sample holding structure:', JSON.stringify(response.holdings[0], null, 2));
    }
    
    if (response.securities && response.securities.length > 0) {
      // Sample security object structure
      console.log('Sample security structure:', JSON.stringify(response.securities[0], null, 2));
    }
    
    // Map the holdings to the expected format
    return response.holdings.map((holding: any) => {
      // Find the corresponding security to get the symbol
      const security = response.securities?.find(
        (s: any) => s.security_id === holding.security_id
      );
      
      // Debug this specific holding
      console.log('Processing holding:', { 
        security_id: holding.security_id,
        quantity: holding.quantity,
        shares: holding.shares,
        institution_value: holding.institution_value,
        cost_basis: holding.cost_basis,
        security: security ? { 
          ticker_symbol: security.ticker_symbol,
          name: security.name,
          type: security.type 
        } : 'No matching security'
      });
      
      // Convert quantity to string for the form
      const sharesValue = String(holding.quantity || holding.shares || 0);
      
      return {
        symbol: security?.ticker_symbol || holding.symbol || 'UNKNOWN',
        shares: sharesValue,
        purchasePrice: holding.cost_basis || holding.purchase_price || 0,
        assetClass: security?.type || holding.asset_class || 'stocks'
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
  createPortfolioFromPlaid: async (accessToken?: string, portfolioName?: string, institutionId?: string) => {
    try {
      // Get holdings from Plaid API
      const holdings = await plaidApi.getInvestmentHoldings(accessToken, institutionId);
      
      if (!holdings || holdings.length === 0) {
        throw new Error('No holdings data available from Plaid');
      }
      
      // Create portfolio with the holdings
      return fetchWithAuth<void>(PLAID_ENDPOINTS.CREATE_PORTFOLIO, {
        method: 'POST',
        body: JSON.stringify({ 
          holdings,
          name: portfolioName || 'Imported Portfolio'
        }),
      });
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
      console.log('Fetching linked accounts from endpoint:', PLAID_ENDPOINTS.LINKED_ACCOUNTS);
      // Get accounts from backend
      const response = await fetchWithAuth(PLAID_ENDPOINTS.LINKED_ACCOUNTS);
      console.log('Linked accounts response:', response);
      
      // Check response structure
      let backendAccounts = [];
      if (response.accounts) {
        backendAccounts = response.accounts;
      } else if (Array.isArray(response)) {
        // Handle case where response is the array directly
        backendAccounts = response;
      } else {
        console.log('Unexpected response structure for linked accounts', response);
      }
      
      // Get local accounts from session storage
      const localTokens = JSON.parse(sessionStorage.getItem('plaid_access_tokens') || '{}');
      const localAccounts = Object.entries(localTokens).map(([institutionId, data]: [string, any]) => ({
        id: data.itemId,
        institution_id: institutionId,
        institution_name: data.institutionName,
        accounts: data.accounts,
        last_updated: data.lastUpdated,
        status: 'active', // Assume active for session storage accounts
        source: 'local' // Mark as local to differentiate
      }));
      
      // Merge accounts (prefer backend accounts if they exist)
      const mergedAccounts = [...localAccounts];
      
      // Add backend accounts that aren't in local storage
      backendAccounts.forEach(backendAccount => {
        const localIndex = mergedAccounts.findIndex(local => 
          local.institution_id === backendAccount.institution_id);
          
        if (localIndex >= 0) {
          // Replace local with backend version
          mergedAccounts[localIndex] = { ...backendAccount, source: 'backend' };
        } else {
          // Add new backend account
          mergedAccounts.push({ ...backendAccount, source: 'backend' });
        }
      });
      
      return mergedAccounts;
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      
      // Fallback to local accounts if backend request fails
      try {
        const localTokens = JSON.parse(sessionStorage.getItem('plaid_access_tokens') || '{}');
        return Object.entries(localTokens).map(([institutionId, data]: [string, any]) => ({
          id: data.itemId,
          institution_id: institutionId,
          institution_name: data.institutionName,
          accounts: data.accounts,
          last_updated: data.lastUpdated,
          status: 'active',
          source: 'local'
        }));
      } catch (fallbackError) {
        console.error('Error getting fallback accounts:', fallbackError);
        return [];
      }
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
      });
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
    try {
      // First get a link token for update mode
      const linkToken = await plaidApi.createLinkToken('default_user_id', true, accountId);
      return { success: true, linkToken, institutionId };
    } catch (error) {
      console.error('Error preparing account update:', error);
      throw error;
    }
  },
  
  /**
   * Get all linked institutions with their accounts
   * Returns a grouped view of institutions and their accounts
   */
  getLinkedInstitutions: async () => {
    try {
      const accounts = await plaidApi.getLinkedAccounts();
      
      // Group by institution
      const institutions = accounts.reduce((acc, account) => {
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
      return [];
    }
  },
};
