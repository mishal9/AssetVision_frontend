/**
 * Plaid API service for Asset Vision
 * Handles all Plaid-related API requests to the Django backend
 */

import { fetchWithAuth } from './api-utils';
import { HoldingInput } from './api';

// Base URL for Plaid API endpoints
const PLAID_API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/plaid`;

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
   */
  createLinkToken: async (userId: string = 'default_user_id'): Promise<string> => {
    try {
      const response = await fetchWithAuth(`${PLAID_API_BASE}/create-link-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
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
   */
  exchangePublicToken: async (publicToken: string) => {
    console.log('Attempting to exchange public token...');
    const response = await fetchWithAuth(`${PLAID_API_BASE}/exchange-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ public_token: publicToken }),
    });
    
    if (!response.access_token) {
      throw new Error('No access token received from server');
    }
    
    console.log('Successfully exchanged token');
    // Store the access token in session storage for later use
    sessionStorage.setItem('plaid_access_token', response.access_token);
    
    return { 
      success: true, 
      accessToken: response.access_token,
      itemId: response.item_id 
    };
  },
  
  /**
   * Get investment holdings from Plaid
   * Calls the Django backend to fetch investment holdings using the stored access token
   */
  getInvestmentHoldings: async (): Promise<HoldingInput[]> => {
    // Get the access token from session storage
    const accessToken = sessionStorage.getItem('plaid_access_token');
    
    if (!accessToken) {
      throw new Error('No Plaid access token available');
    }
    
    console.log('Attempting to fetch holdings from API...');
    const response = await fetchWithAuth(`${PLAID_API_BASE}/get-holdings/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ access_token: accessToken }),
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
   */
  createPortfolioFromPlaid: async () => {
    try {
      // Get holdings from Plaid API
      const holdings = await plaidApi.getInvestmentHoldings();
      
      if (!holdings || holdings.length === 0) {
        throw new Error('No holdings data available from Plaid');
      }
      
      // Create portfolio with the holdings
      return fetchWithAuth<void>('/portfolio', {
        method: 'POST',
        body: JSON.stringify({ holdings }),
      });
    } catch (error) {
      console.error('Error creating portfolio from Plaid:', error);
      throw error;
    }
  },
};
