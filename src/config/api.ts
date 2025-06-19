/**
 * API Configuration
 * Centralized configuration for all API endpoints in the application
 */

// Base API URL - Fallbacks to localhost if not defined
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Base URL without /api suffix for direct endpoint construction
export const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8000';


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
  HAS_PORTFOLIO: `${API_BASE_URL}/portfolios/exists/`,
  PERFORMANCE: (id: string) => `${API_BASE_URL}/portfolios/${id}/performance/`,
  ALLOCATION: (id: string) => `${API_BASE_URL}/portfolios/${id}/allocation/`,
  SUMMARY: `${API_BASE_URL}/portfolios/summary/`,
  ALERTS: `${API_BASE_URL}/portfolios/alerts/`,
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
