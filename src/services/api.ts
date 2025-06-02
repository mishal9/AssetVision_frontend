/**
 * API service for Asset Vision
 * Handles all API requests to the backend
 */

import { fetchWithAuth } from './api-utils';

/**
 * Portfolio API methods
 */
export const portfolioApi = {
  /**
   * Get user portfolio summary
   */
  getPortfolioSummary: () => 
    fetchWithAuth<PortfolioSummary>('/portfolio/summary'),
  
  /**
   * Get portfolio performance over time
   */
  getPerformance: (period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month') => 
    fetchWithAuth<PerformanceData[]>(`/portfolio/performance?period=${period}`),
  
  /**
   * Get asset allocation
   */
  getAssetAllocation: () => 
    fetchWithAuth<AllocationResponse>('/portfolio/allocation'),
    
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
    fetchWithAuth<{ hasPortfolio: boolean }>('/portfolio/status')
      .then(response => response.hasPortfolio)
      .catch(() => false),
};

/**
 * Alerts API methods
 */
export const alertsApi = {
  /**
   * Get all user alerts
   */
  getAlerts: () => 
    fetchWithAuth<Alert[]>('/alerts'),
  
  /**
   * Create a new alert
   */
  createAlert: (alertData: AlertInput) => 
    fetchWithAuth<Alert>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    }),
  
  /**
   * Update an existing alert
   */
  updateAlert: (alertId: string, alertData: Partial<AlertInput>) => 
    fetchWithAuth<Alert>(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify(alertData),
    }),
  
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
    fetchWithAuth<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  /**
   * Register new user
   */
  register: (userData: RegisterInput) => 
    fetchWithAuth<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  /**
   * Refresh authentication token
   */
  refreshToken: (refreshToken: string) => 
    fetchWithAuth<TokenRefreshResponse>('/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }),
    
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
    fetchWithAuth<UserInfoResponse>('/auth/user/'),
    
  /**
   * Logout user
   */
  logout: () => 
    fetchWithAuth<{ success: boolean }>('/auth/logout/', {
      method: 'POST',
    }),
};

// Type definitions
export interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  totalGain: number;
  totalGainPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  dividend_yield: number;
  portfolio_name?: string;
  sector_allocation?: Record<string, number>;
  performance?: {
    one_year: number;
    three_year: number;
    five_year: number;
    ytd: number;
    total_return: number;
  };
  equity_allocation_percentage?: number;
  total_holdings?: number;
  last_updated?: string;
}

export interface PerformanceData {
  date: string;
  value: number;
}

export interface AssetAllocation {
  category: string;
  percentage: number;
  value: number;
}

export interface AllocationResponse {
  asset_allocation: AssetAllocation[];
  sector_allocation: AssetAllocation[];
}

export interface HoldingInput {
  symbol: string;
  shares: number;
  purchasePrice: number;
  assetClass: string;
}

export interface Alert {
  id: string;
  type: 'price' | 'news' | 'dividend' | 'tax';
  symbol?: string;
  threshold?: number;
  active: boolean;
  createdAt: string;
}

export interface AlertInput {
  type: 'price' | 'news' | 'dividend' | 'tax';
  symbol?: string;
  threshold?: number;
  active?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user: {
    id: number;
    username: string;
    email: string;
  };
  tokens: {
    access: string;
    refresh: string;
    access_expires_in: number;
    refresh_expires_in: number;
  };
}

export interface TokenRefreshResponse {
  success: boolean;
  access: string;
  access_expires_in: number;
}

export interface UserInfoResponse {
  authenticated: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}
