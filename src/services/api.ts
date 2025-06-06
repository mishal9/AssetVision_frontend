/**
 * API service for Asset Vision
 * Handles all API requests to the backend
 */

import { fetchWithAuth } from './api-utils';
import { PortfolioSummary, PortfolioSummaryResponse, PerformanceData, AllocationResponse, HoldingInput } from '@/types/portfolio';
import { Alert, AlertResponse, AlertInput } from '@/types/alerts';
import { AuthResponse, AuthResponseData } from '@/types/auth';
import { TaxLossOpportunity, TaxLossResponse } from '@/types/tax';
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
};

/**
 * Alerts API methods
 */
export const alertsApi = {
  /**
   * Get all user alerts
   */
  getAlerts: () => 
    fetchWithAuth<AlertResponse[]>('/alerts')
      .then(response => convertSnakeToCamelCase<Alert[]>(response)),
  
  /**
   * Create a new alert
   */
  createAlert: (alertData: AlertInput) => 
    fetchWithAuth<AlertResponse>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    })
      .then(response => convertSnakeToCamelCase<Alert>(response)),
  
  /**
   * Update an existing alert
   */
  updateAlert: (alertId: string, alertData: Partial<AlertInput>) => 
    fetchWithAuth<AlertResponse>(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify(alertData),
    })
      .then(response => convertSnakeToCamelCase<Alert>(response)),
  
  /**
   * Delete an alert
   */
  deleteAlert: (alertId: string) => 
    fetchWithAuth<void>(`/alerts/${alertId}`, {
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

// End of API definitions
