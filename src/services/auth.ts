import { authApi } from './api';
import { AuthResponse, UserInfoResponse } from '../types/auth';

/**
 * Authentication service for Asset Vision
 * Handles user authentication and session management via HTTP-only cookies
 * All authentication tokens are managed server-side through secure cookies
 */
class AuthService {
  private static instance: AuthService;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Token refresh is handled automatically by the backend via cookies
    // No client-side token management needed
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
   * @param username Username or email
   * @param password User password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Auth Service: Starting login process');
      const response = await authApi.login(username, password);
      
      console.log('🔐 Auth Service: Login response:', response);
      
      // Authentication tokens are now handled via HTTP-only cookies
      // No client-side token storage needed
      
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
      

      throw error;
    }
  }

  /**
   * Register new user and authenticate
   */
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.register({ username, email, password });
      
      // Authentication tokens are now handled via HTTP-only cookies
      // No client-side token storage needed
      
      return response;
    } catch (error) {

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

      throw error;
    }
  }

  /**
   * Get current user information
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    try {
      return await authApi.getUserInfo();
    } catch (error) {

      throw error;
    }
  }

  /**
   * Logout user and clear authentication cookies
   */
  async logout(): Promise<void> {
    try {
      // Call the backend logout endpoint to clear HTTP-only cookies
      await authApi.logout();
    } catch (error) {
      // Continue with local cleanup even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear any refresh timers
      if (this.tokenRefreshTimer) {
        clearTimeout(this.tokenRefreshTimer);
        this.tokenRefreshTimer = null;
      }
      
      // Redirect to login page to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Check if user is authenticated
   * Since tokens are in HTTP-only cookies, we need to make an API call to verify
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      console.log('🔍 Auth Service: Checking authentication status');
      console.log('🔍 Auth Service: Calling getUserInfo...');
      
      const userInfo = await authApi.getUserInfo();
      
      console.log('🔍 Auth Service: getUserInfo response:', userInfo);
      console.log('🔍 Auth Service: User authenticated successfully');
      return true;
    } catch (error: any) {
      console.log('🔍 Auth Service: getUserInfo failed');
      console.log('🔍 Auth Service: Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        stack: error.stack
      });
      return false;
    }
  }

  /**
   * Token management is now handled entirely by HTTP-only cookies
   * These methods are no longer needed as tokens are managed server-side
   */
  
  // Note: Token refresh is handled automatically by the backend
  // The server will refresh tokens and update cookies as needed
}

export const authService = AuthService.getInstance();
