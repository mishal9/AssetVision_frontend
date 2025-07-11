/**
 * Authentication Type Definitions
 * Contains type definitions for authentication-related data
 */
// AUth
// API Response Types (snake_case as returned from backend)
export interface AuthResponseData {
  access_token: string;
  refresh_token: string;
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
}

// Frontend Types (camelCase for React components)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}
