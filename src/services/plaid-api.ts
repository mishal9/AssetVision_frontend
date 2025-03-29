/**
 * Plaid API service for Asset Vision
 * Handles all Plaid-related API requests to the Django backend
 */

import { fetchWithAuth } from './api-utils';
import { HoldingInput } from './api';

// Base URL for Plaid API endpoints
const PLAID_API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/plaid`;

// Fallback mock data in case API is unavailable
const FALLBACK_MOCK_HOLDINGS = [
  { symbol: 'AAPL', shares: 10, purchasePrice: 150, assetClass: 'stocks' },
  { symbol: 'MSFT', shares: 5, purchasePrice: 280, assetClass: 'stocks' },
  { symbol: 'GOOGL', shares: 2, purchasePrice: 2800, assetClass: 'stocks' },
  { symbol: 'AMZN', shares: 3, purchasePrice: 3300, assetClass: 'stocks' },
  { symbol: 'TSLA', shares: 8, purchasePrice: 900, assetClass: 'stocks' },
];

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
    
    if (!response.holdings || !Array.isArray(response.holdings)) {
      throw new Error('Invalid holdings data format received from server');
    }
    
    console.log('Successfully fetched holdings from API');
    // Map the response to the expected format
    return response.holdings.map((holding: any) => ({
      symbol: holding.symbol,
      shares: holding.shares,
      purchasePrice: holding.purchase_price || 0,
      assetClass: holding.asset_class || 'stocks'
    }));
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
