/**
 * API service for AlphaOptimize
 * Handles all API requests to the backend
 */

import { fetchWithAuth } from './api-utils';
import { convertSnakeToCamelCase } from '../utils/caseConversions';
import { AUTH_ENDPOINTS, PORTFOLIO_ENDPOINTS, RISK_ENDPOINTS } from '../config/api';
import { PortfolioSummary, PortfolioSummaryResponse, PerformanceData, AllocationResponse, HoldingInput, DriftResponse } from '@/types/portfolio';
import { 
  AuthResponse,
  UserInfoResponse
} from '../types/auth';
import { MarketRegionSettings, TaxSettings } from '../store/preferencesSlice';
import { TaxLossResponse, TaxEfficiencyResponse } from '@/types/tax';

/**
 * Portfolio API methods
 */
export const portfolioApi = {
  /**
   * Get user portfolio summary
   * Fetches the portfolio summary and transforms snake_case to camelCase
   */
  getPortfolioSummary: () => 
    fetchWithAuth<PortfolioSummaryResponse>(PORTFOLIO_ENDPOINTS.SUMMARY)
      .then(response => convertSnakeToCamelCase<PortfolioSummary>(response)),
  
  /**
   * Get portfolio performance over time
   * @param period Time period for performance data ('1D', '1W', '1M', '1Y', '5Y', or 'all')
   */
  getPerformance: (period: '1D' | '1W' | '1M' | '1Y' | '5Y' | 'all' = '1M') => 
    fetchWithAuth<any[]>(`${PORTFOLIO_ENDPOINTS.PERFORMANCE}?period=${period}`)
      .then(response => convertSnakeToCamelCase<PerformanceData[]>(response)),
  
  /**
   * Get asset allocation
   * @returns Promise with asset and sector allocation data
   */
  getAssetAllocation: () => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.ALLOCATION)
      .then(response => {
        // Convert snake_case to camelCase
        const convertedData = convertSnakeToCamelCase<AllocationResponse>(response);
        
        return convertedData;
      }),
    
  /**
   * Create a new portfolio with holdings
   */
  createPortfolio: (data: { holdings: HoldingInput[] }) => 
    fetchWithAuth<void>('/portfolio', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  /**
   * Check if user has a portfolio
   */
  hasPortfolio: () => 
    fetchWithAuth<{ has_portfolio: boolean }>(PORTFOLIO_ENDPOINTS.HAS_PORTFOLIO)
      .then(response => convertSnakeToCamelCase<{ hasPortfolio: boolean }>(response))
      .then(response => response.hasPortfolio)
      .catch(() => false),
    
  /**
   * Get tax loss harvesting opportunities
   * Fetches tax-optimized recommendations for portfolio holdings
   */
  getTaxLossHarvestingOpportunities: () => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.TAX_LOSS_HARVESTING)
      .then(response => convertSnakeToCamelCase<TaxLossResponse>(response)),
      
  /**
   * Get tax efficiency analysis
   * Analyzes tax efficiency of asset placement in taxable vs tax-advantaged accounts
   */
  getTaxEfficiencyAnalysis: () => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.TAX_EFFICIENCY)
      .then(response => convertSnakeToCamelCase<TaxEfficiencyResponse>(response)),
      
  /**
   * Get portfolio drift analysis
   * Compares current allocations to target allocations to identify portfolio drift
   * @param portfolioId ID of the portfolio to analyze
   */
  getPortfolioDrift: () => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.DRIFT)
      .then(response => convertSnakeToCamelCase<DriftResponse>(response)),
      
  /**
   * Get available asset classes for target allocations
   * Includes current allocation percentages if available
   */
  getAssetClasses: () => 
    fetchWithAuth<any[]>(PORTFOLIO_ENDPOINTS.ASSET_CLASSES)
      .then(response => convertSnakeToCamelCase<any[]>(response)),
      
  /**
   * Get available sectors for target allocations
   * Includes current allocation percentages if available
   */
  getSectors: () => 
    fetchWithAuth<any[]>(PORTFOLIO_ENDPOINTS.SECTORS)
      .then(response => convertSnakeToCamelCase<any[]>(response)),
      
  /**
   * Save target allocations for the portfolio
   * @param allocations Array of asset allocations with target percentages
   */
  saveTargetAllocations: (allocations: { asset_id: string; target_percentage: number }[]) => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.TARGET_ALLOCATIONS, {
      method: 'POST',
      body: JSON.stringify(allocations),
    }),
      
  /**
   * Save sector target allocations for the portfolio
   * @param allocations Array of sector allocations with target percentages
   */
  saveSectorTargetAllocations: (allocations: { asset_id: string; target_percentage: number }[]) => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.SECTOR_TARGET_ALLOCATIONS, {
      method: 'POST',
      body: JSON.stringify(allocations),
    }),
      
  /**
   * Get the active portfolio ID
   * Uses the summary endpoint since active endpoint was deprecated
   */
  getActivePortfolioId: () => 
    fetchWithAuth<any>(PORTFOLIO_ENDPOINTS.SUMMARY)
      .then(response => {
        // The summary endpoint doesn't directly return an ID field
        // So we extract from the response structure if available
        const portfolioId = response.portfolio_id || '';
        return portfolioId;
      })
      .catch(() => ''),
};


/**
 * Auth API methods
 * Note: Login, register, and refresh don't require auth tokens, so fetchWithAuth
 * will work correctly (it only adds auth header if token exists)
 */
export const authApi = {
  /**
   * Login user
   * @param email User email
   * @param password User password
   */
  login: async (email: string, password: string) => {
    return fetchWithAuth<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }).then(response => convertSnakeToCamelCase<AuthResponse>(response));
  },
  
  /**
   * Register new user
   */
  register: async (userData: any) => {
    return fetchWithAuth<AuthResponse>(AUTH_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    }).then(response => convertSnakeToCamelCase<AuthResponse>(response));
  },
  
  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken: string) => {
    return fetchWithAuth<any>(AUTH_ENDPOINTS.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }).then(response => convertSnakeToCamelCase<any>(response));
  },
    
  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await fetchWithAuth<void>(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ 
        email,
        // Provide redirect_to so Supabase recovery link returns to frontend reset page
        redirect_to: (typeof window !== 'undefined') ? `${window.location.origin}/reset-password` : undefined,
      }),
    });
  },

  /**
   * Reset password using Supabase recovery token
   */
  resetPassword: async (token: string, password: string): Promise<void> => {
    await fetchWithAuth<void>(AUTH_ENDPOINTS.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
    
  /**
   * Get current user information
   */
  getUserInfo: () => {
    return fetchWithAuth<UserInfoResponse>(AUTH_ENDPOINTS.USER);
  },
    
  /**
   * Logout user
   */
  logout: () => {
    return fetchWithAuth<void>(AUTH_ENDPOINTS.LOGOUT, {
      method: 'POST',
    });
  },
};

/**
 * Preferences API methods
 */
export const preferencesApi = {
  /**
   * Get user preferences
   * 
   * @returns {Promise<{marketRegion: MarketRegionSettings, tax: TaxSettings}>}
   * 
   * API Response format:
   * - Percentages are returned as decimal values (0.24 = 24%)
   * - State of residence is a two-letter code (e.g., 'CA', 'NY')
   * - Tax filing status is uppercase (e.g., 'SINGLE', 'MARRIED_FILING_JOINTLY')
   */
  getPreferences: () => 
    fetchWithAuth<any>('/preferences/')
      .then(response => {
        // Convert decimal percentages to whole numbers (e.g., 0.24 to 24)
        const convertPercentage = (value: string | number | null | undefined): number => {
          if (value === null || value === undefined) return 0;
          return Number(value) * 100 || 0;
        };

        // The API returns a flat structure, so we need to map it to our nested structure
        return {
          marketRegion: {
            marketRegion: response.market_region || '',
            riskFreeRate: response.risk_free_rate || '',
            inflationSeries: response.inflation_series || '',
            default_benchmark: response.default_benchmark || ''
          },
          tax: {
            federalIncomeTax: convertPercentage(response.federal_income_tax),
            stateIncomeTax: convertPercentage(response.state_income_tax),
            pretaxAnnualIncome: Number(response.approximate_pre_tax_annual_income) || 0,
            // Use exact state code from API (e.g., 'CA', 'NY')
            stateOfResidence: response.state_of_residence || '',
            // Normalize tax filing status (convert from uppercase to title case if needed)
            taxFilingStatus: response.tax_filing_status || '',
            longTermCapitalGainsTax: convertPercentage(response.long_term_capital_gains_tax),
            shortTermCapitalGainsTax: convertPercentage(response.short_term_capital_gains_tax)
          }
        };
      }),
  
  /**
   * Update user preferences
   * 
   * @param preferences Object containing marketRegion and tax settings
   * @returns Promise
   * 
   * API Submission format:
   * - Percentages should be sent as decimal values (e.g., 24% as 0.24)
   * - State of residence should be a two-letter code (e.g., 'CA', 'NY')
   * - Tax filing status should match the API's expected format
   */
  updatePreferences: (preferences: {marketRegion: MarketRegionSettings, tax: TaxSettings}) => {
    // Helper to convert percentage values back to decimal for API (e.g., 24 to 0.24)
    const convertToDecimalPercentage = (value: number | null | undefined): number => {
      if (value === null || value === undefined) return 0;
      return Number(value) / 100 || 0;
    };
    
    // Convert from camelCase to snake_case for the API and format values correctly
    const data = {
        market_region: preferences.marketRegion.marketRegion,
        risk_free_rate: preferences.marketRegion.riskFreeRate,
        inflation_series: preferences.marketRegion.inflationSeries,
        default_benchmark: preferences.marketRegion.default_benchmark,
        federal_income_tax: convertToDecimalPercentage(preferences.tax.federalIncomeTax),
        state_income_tax: convertToDecimalPercentage(preferences.tax.stateIncomeTax),
        approximate_pre_tax_annual_income: preferences.tax.pretaxAnnualIncome,
        state_of_residence: preferences.tax.stateOfResidence,
        tax_filing_status: preferences.tax.taxFilingStatus,
        long_term_capital_gains_tax: convertToDecimalPercentage(preferences.tax.longTermCapitalGainsTax),
        short_term_capital_gains_tax: convertToDecimalPercentage(preferences.tax.shortTermCapitalGainsTax)
    };
    
    return fetchWithAuth('/preferences/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
};

/**
 * Chat API methods
 * Backend-powered LLM integration
 */
export const chatApi = {
  /**
   * Send a message to the AI assistant via the backend
   * @param messages Array of message objects with role and content
   * @param context Current application context
   * @returns Promise with the AI response
   */
  sendMessage: (
    messages: { role: 'user' | 'assistant'; content: string }[], 
    context: { page?: string; section?: string; portfolioId?: string; assetId?: string }
  ) => 
    fetchWithAuth<{ response: string }>('/ai/chat/', {
      method: 'POST',
      body: JSON.stringify({ 
        message: messages.length > 0 ? messages[messages.length - 1].content : '',
        messages: messages, 
        context 
      }),
    })
      .then(response => response.response),
  
  /**
   * Get AI-generated insights for a specific portfolio
   * @param portfolioId ID of the portfolio to analyze
   * @returns Promise with portfolio insights
   */
  getPortfolioInsights: (portfolioId: string) => 
    fetchWithAuth<{ insights: string }>(`/ai/insights/portfolio/${portfolioId}`)
      .then(response => response.insights),
      
  /**
   * Get AI-generated recommendations for portfolio optimization
   * @param portfolioId ID of the portfolio to optimize
   * @returns Promise with optimization recommendations
   */
  getOptimizationRecommendations: (portfolioId: string) => 
    fetchWithAuth<{ recommendations: string }>(`/ai/recommendations/portfolio/${portfolioId}`)
      .then(response => response.recommendations),
};

/**
 * Risk analysis / optimization API methods
 */
export const riskApi = {
  /**
   * Run portfolio optimization on the backend
   * Delegates all heavy calculations to the Django service.
   * @param data Data required for portfolio optimization (strategy, parameters, holdings, etc.)
   */
  optimizePortfolio: (data: any) =>
    fetchWithAuth<any>(RISK_ENDPOINTS.OPTIMIZE, {
      method: 'POST',
      body: JSON.stringify({
        // Always optimise this predefined set of holdings
        ...data,
        symbols: ['NFLX', 'AAPL', 'NVDA'],
        // Request additional analytics now supported by the backend
        include_mu: true,
        include_covariance: true,
        include_frontier: true,
        frontier_steps: data?.frontier_steps ?? 10,
      }),
    }).then(response => convertSnakeToCamelCase<any>(response)),
};

// End of API definitions
