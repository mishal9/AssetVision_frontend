/**
 * API service for Asset Vision
 * Handles all API requests to the backend
 */

import { fetchWithAuth } from './api-utils';
import { PortfolioSummary, PortfolioSummaryResponse, PerformanceData, AllocationResponse, HoldingInput } from '@/types/portfolio';
import { Alert, AlertResponse, AlertInput } from '@/types/alerts';
import { AuthResponse, AuthResponseData } from '@/types/auth';
import { TaxLossOpportunity, TaxLossResponse, TaxEfficiencyResponse } from '@/types/tax';
import { MarketRegionSettings, TaxSettings } from '@/store/preferencesSlice';
import { convertSnakeToCamelCase } from '@/utils/caseConversions';

/**
 * Portfolio API methods
 */
export const portfolioApi = {
  /**
   * Get user portfolio summary
   * Fetches the portfolio summary and transforms snake_case to camelCase
   */
  getPortfolioSummary: () => 
    fetchWithAuth<PortfolioSummaryResponse>('/portfolio/summary')
      .then(response => convertSnakeToCamelCase<PortfolioSummary>(response)),
  
  /**
   * Get portfolio performance over time
   */
  getPerformance: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month') => 
    fetchWithAuth<any[]>(`/portfolio/performance?period=${period}`)
      .then(response => convertSnakeToCamelCase<PerformanceData[]>(response)),
  
  /**
   * Get asset allocation
   */
  getAssetAllocation: () => 
    fetchWithAuth<any>('/portfolio/allocation')
      .then(response => convertSnakeToCamelCase<AllocationResponse>(response)),
    
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
    fetchWithAuth<{ has_portfolio: boolean }>('/portfolio/status')
      .then(response => convertSnakeToCamelCase<{ hasPortfolio: boolean }>(response))
      .then(response => response.hasPortfolio)
      .catch(() => false),
    
  /**
   * Get tax loss harvesting opportunities
   * Fetches tax-optimized recommendations for portfolio holdings
   */
  getTaxLossHarvestingOpportunities: () => 
    fetchWithAuth<any>('/portfolio/tax-loss-harvesting')
      .then(response => convertSnakeToCamelCase<TaxLossResponse>(response)),
      
  /**
   * Get tax efficiency analysis
   * Analyzes tax efficiency of asset placement in taxable vs tax-advantaged accounts
   */
  getTaxEfficiencyAnalysis: () => 
    fetchWithAuth<any>('/portfolio/tax-efficiency-analysis')
      .then(response => convertSnakeToCamelCase<TaxEfficiencyResponse>(response)),
};

/**
 * Alerts API methods
 */
export const alertsApi = {
  /**
   * Get all user alerts
   */
  getAlerts: () => 
    fetchWithAuth<AlertResponse[]>('/alerts/rules/')
      .then(response => convertSnakeToCamelCase<Alert[]>(response)),
  
  /**
   * Create a new alert
   */
  createAlert: (alertData: any) => 
    fetchWithAuth<AlertResponse>('/alerts/rules/', {
      method: 'POST',
      body: JSON.stringify(alertData),
    })
      .then(response => convertSnakeToCamelCase<Alert>(response)),
  
  /**
   * Update an existing alert
   */
  updateAlert: (alertId: string, alertData: Partial<AlertInput>) => 
    fetchWithAuth<AlertResponse>(`/alerts/rules/${alertId}/`, {
      method: 'PATCH',
      body: JSON.stringify(alertData),
    })
      .then(response => convertSnakeToCamelCase<Alert>(response)),
  
  /**
   * Delete an alert
   */
  deleteAlert: (alertId: string) => 
    fetchWithAuth<void>(`/alerts/rules/${alertId}/`, {
      method: 'DELETE',
    }),
};

/**
 * Auth API methods
 */
export const authApi = {
  /**
   * Login user
   * @param username Username or email
   * @param password User password
   */
  login: (username: string, password: string) => 
    fetchWithAuth<AuthResponseData>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
      .then(response => convertSnakeToCamelCase<AuthResponse>(response)),
  
  /**
   * Register new user
   */
  register: (userData: any) => 
    fetchWithAuth<AuthResponseData>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
      .then(response => convertSnakeToCamelCase<AuthResponse>(response)),
  
  /**
   * Refresh authentication token
   */
  refreshToken: (refreshToken: string) => 
    fetchWithAuth<any>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    })
      .then(response => convertSnakeToCamelCase<any>(response)),
    
  /**
   * Request password reset
   */
  requestPasswordReset: (email: string) => 
    fetchWithAuth<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
  /**
   * Get current user information
   */
  getUserInfo: () => 
    fetchWithAuth<any>('/auth/user/')
      .then(response => convertSnakeToCamelCase<any>(response)),
    
  /**
   * Logout user
   */
  logout: () => 
    fetchWithAuth<any>('/auth/logout/', {
      method: 'POST',
    })
      .then(response => convertSnakeToCamelCase<{ success: boolean }>(response)),
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

// End of API definitions
