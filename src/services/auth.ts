import { authApi, type AuthResponse, type UserInfoResponse } from './api';

/**
 * Authentication service for Asset Vision
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
   * Login user and store authentication tokens
   * @param username Username or email
   * @param password User password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.login(username, password);
      
      if (response.success && response.tokens) {
        this.setTokens(
          response.tokens.access, 
          response.tokens.refresh, 
          response.tokens.access_expires_in,
          response.tokens.refresh_expires_in
        );
        this.setupTokenRefresh(response.tokens.access_expires_in);
        
        // Update Redux state with user info
        // Note: This requires importing the function in the module that uses this method
        // to avoid circular dependencies
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
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
