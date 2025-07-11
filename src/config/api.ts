/**
 * API Configuration
 * Centralized configuration for all API endpoints in the application
 */

// Backend URL configuration
export const BACKEND_URL = 'https://cl3fc954-8000.use.devtunnels.ms';

// Base API URL - always use the full backend URL
export const API_BASE_URL = `${BACKEND_URL}/api`;

// API host - used for WebSocket connection
export const API_HOST = BACKEND_URL.replace(/^https?:\/\//, '');

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login/`,
  REGISTER: `${API_BASE_URL}/auth/register/`,
  LOGOUT: `${API_BASE_URL}/auth/logout/`,
  REFRESH: `${API_BASE_URL}/auth/refresh/`,
  USER: `${API_BASE_URL}/auth/user/`,
};

// Portfolio endpoints
export const PORTFOLIO_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/portfolios/`,
  GET_ALL: `${API_BASE_URL}/portfolios/`,
  GET_BY_ID: (id: string) => `${API_BASE_URL}/portfolios/${id}/`,
  UPDATE: (id: string) => `${API_BASE_URL}/portfolios/${id}/`,
  DELETE: (id: string) => `${API_BASE_URL}/portfolios/${id}/`,
  HAS_PORTFOLIO: `${API_BASE_URL}/portfolio/status`,  // Returns {has_portfolio: boolean}
  PERFORMANCE: `${API_BASE_URL}/portfolio/performance/`,  // Uses the active user's portfolio
  ALLOCATION: `${API_BASE_URL}/portfolio/allocation/`,  // Uses the active user's portfolio
  DRIFT: `${API_BASE_URL}/portfolio/drift/`,  // Uses the active user's portfolio
  SUMMARY: `${API_BASE_URL}/portfolio/summary`,  // Uses singular 'portfolio' path
  TAX_LOSS_HARVESTING: `${API_BASE_URL}/portfolio/tax-loss-harvesting/`,  // Uses the active user's portfolio
  TAX_EFFICIENCY: `${API_BASE_URL}/portfolio/tax-efficiency-analysis/`,  // Uses the active user's portfolio
  ALERTS: `${API_BASE_URL}/alerts/`,  // The alerts endpoints are under /api/alerts/ in the backend
  ASSET_CLASSES: `${API_BASE_URL}/portfolio/asset-classes/`,  // Get available asset classes
  TARGET_ALLOCATIONS: `${API_BASE_URL}/portfolio/target-allocations/`,  // Save target allocations
};

// Plaid endpoints - using API_HOST to avoid double /api prefixing
export const PLAID_ENDPOINTS = {
  CREATE_LINK_TOKEN: `${API_HOST}/api/plaid/create-link-token/`,
  EXCHANGE_TOKEN: `${API_HOST}/api/plaid/exchange-token/`,
  GET_HOLDINGS: `${API_HOST}/api/plaid/get-holdings/`,
  LINKED_ACCOUNTS: `${API_HOST}/api/plaid/list-connections/`,
  DISCONNECT_ACCOUNT: (id: string) => `${API_HOST}/api/plaid/disconnect-account/${id}/`,
  UPDATE_CONNECTION: (id: string) => `${API_HOST}/api/plaid/update-connection/${id}/`,
  CREATE_PORTFOLIO: `${API_HOST}/api/portfolio/`,
};

// WebSocket endpoints
export const WEBSOCKET_ENDPOINTS = {
  CONNECT: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001/ws/market-data/',
};

// Export a combined object for easy imports
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: AUTH_ENDPOINTS,
  PORTFOLIO: PORTFOLIO_ENDPOINTS,
  PLAID: PLAID_ENDPOINTS,
  WEBSOCKET: WEBSOCKET_ENDPOINTS,
};

export default API_CONFIG;
