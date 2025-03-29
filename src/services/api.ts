/**
 * API service for Asset Vision
 * Handles all API requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithAuth<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get the JWT token from cookies or localStorage
  let token;
  
  // Try to get from cookies first
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (tokenCookie) {
      token = tokenCookie.split('=')[1];
    }
  }
  
  // Fall back to localStorage
  if (!token && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

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
    fetchWithAuth<AssetAllocation[]>('/portfolio/allocation'),
    
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
   */
  login: (email: string, password: string) => 
    fetchWithAuth<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  /**
   * Register new user
   */
  register: (userData: RegisterInput) => 
    fetchWithAuth<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  /**
   * Refresh authentication token
   */
  refreshToken: () => 
    fetchWithAuth<AuthResponse>('/auth/refresh', {
      method: 'POST',
    }),
    
  /**
   * Request password reset
   */
  requestPasswordReset: (email: string) => 
    fetchWithAuth<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}
