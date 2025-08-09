import { authApi } from './api';
import { AuthResponse, UserInfoResponse } from '../types/auth';

/**
 * Authentication service for AlphaOptimize
 * Handles user authentication, token management, and session persistence
 */
class AuthService {
  private static instance: AuthService;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize token refresh if tokens exist
    if (typeof window !== 'undefined' && this.getToken()) {
      this.setupTokenRefresh();
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Error types for authentication
   */
  readonly AuthErrorType = {
    INVALID_CREDENTIALS: 'invalid_credentials',
    ACCOUNT_LOCKED: 'account_locked',
    SERVER_ERROR: 'server_error',
    NETWORK_ERROR: 'network_error',
    UNKNOWN_ERROR: 'unknown_error'
  };

  /**
   * Login user and store authentication tokens
   * @param email User email
   * @param password User password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.tokens) {
        this.setTokens(
          response.tokens.access, 
          response.tokens.refresh, 
          response.tokens.access_expires_in,
          response.tokens.refresh_expires_in
        );
        this.setupTokenRefresh(response.tokens.access_expires_in);
      }
      
      return response;
    } catch (error: any) {
      // Create a structured error object with type and message
      const authError: { type: string; message: string } = {
        type: this.AuthErrorType.UNKNOWN_ERROR,
        message: 'An unexpected error occurred during login.'
      };
      
      // Check if it's a response error with status code
      if (error.status === 401 || (error.message && error.message.includes('401'))) {
        authError.type = this.AuthErrorType.INVALID_CREDENTIALS;
        authError.message = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.status === 403 || (error.message && error.message.includes('locked'))) {
        authError.type = this.AuthErrorType.ACCOUNT_LOCKED;
        authError.message = 'Your account has been locked due to too many failed attempts. Please reset your password or contact support.';
      } else if (error.status >= 500 || (error.message && error.message.includes('server'))) {
        authError.type = this.AuthErrorType.SERVER_ERROR;
        authError.message = 'The server is currently unavailable. Please try again later.';
      } else if (error.message && (error.message.includes('network') || error.message.includes('fetch'))) {
        authError.type = this.AuthErrorType.NETWORK_ERROR;
        authError.message = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      // Attach the error type and enhanced message to the original error
      error.authErrorType = authError.type;
      error.authErrorMessage = authError.message;
      
      console.error('Login failed:', authError.type, authError.message);
      throw error;
    }
  }

  /**
   * Register new user and authenticate
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.register({ username, email, password });
      
      if (response.success && response.tokens) {
        this.setTokens(
          response.tokens.access, 
          response.tokens.refresh,
          response.tokens.access_expires_in,
          response.tokens.refresh_expires_in
        );
        this.setupTokenRefresh(response.tokens.access_expires_in);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await authApi.requestPasswordReset(email);
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  /**
   * Reset password using recovery token from Supabase
   */
  async resetPassword(token: string, password: string): Promise<void> {
    try {
      await authApi.resetPassword(token, password);
    } catch (error: any) {
      // Normalize error for UI
      const err: any = error instanceof Error ? error : new Error('Password reset failed');
      err.authErrorMessage = err.message || 'Password reset failed';
      throw err;
    }
  }

  /**
   * Get current user information
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      return await authApi.getUserInfo();
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear tokens from both cookies and localStorage
   */
  async logout(): Promise<void> {
    try {
      // Call the backend logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
      
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
      
      // Clear Redux state
      // Note: This requires importing the function in the module that uses this method
      // to avoid circular dependencies
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get the current authentication token
   * First tries to get from cookies, falls back to localStorage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookies first
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    // Fall back to localStorage
    return localStorage.getItem('auth_token');
  }

  /**
   * Get the refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookies first
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('refresh_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    // Fall back to localStorage
    return localStorage.getItem('refresh_token');
  }

  /**
   * Store authentication tokens in cookies and localStorage
   */
  private setTokens(
    accessToken: string, 
    refreshToken: string, 
    accessExpiresIn: number = 1800, // 30 minutes in seconds
    refreshExpiresIn: number = 604800 // 7 days in seconds
  ): void {
    // Set cookies
    document.cookie = `auth_token=${accessToken}; path=/; max-age=${accessExpiresIn}; SameSite=Strict`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${refreshExpiresIn}; SameSite=Strict`;
    
    // Also store in localStorage for client-side access
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Set up automatic token refresh
   * @param expiresInSeconds Token expiration time in seconds
   */
  private setupTokenRefresh(expiresInSeconds: number = 1800): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh token 5 minutes before expiration
    const refreshTimeMs = (expiresInSeconds - 300) * 1000; // 5 minutes before expiration
    
    this.tokenRefreshTimer = setTimeout(async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await authApi.refreshToken(refreshToken);
        
        if (response.success) {
          this.setTokens(
            response.access, 
            refreshToken, // Keep the same refresh token
            response.access_expires_in
          );
          this.setupTokenRefresh(response.access_expires_in); // Set up the next refresh
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.logout(); // Force logout on refresh failure
      }
    }, refreshTimeMs);
  }
}

export const authService = AuthService.getInstance();
