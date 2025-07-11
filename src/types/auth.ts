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
  // Add tokens property for backward compatibility
  tokens?: {
    access: string;
    refresh: string;
    access_expires_in: number;
    refresh_expires_in: number;
  };
  success?: boolean;
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

/**
 * User registration input for API
 * Used for strongly typed API requests
 */
export interface UserRegistrationInput {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

// User information response from backend (snake_case)
export interface UserInfoResponseData {
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  preferences?: Record<string, unknown>;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

// Frontend user info (camelCase)
export interface UserInfoResponse {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  preferences?: Record<string, unknown>;
  isActive: boolean;
  dateJoined: string;
  lastLogin?: string;
}
