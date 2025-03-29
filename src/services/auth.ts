import { authApi, type AuthResponse } from './api';

/**
 * Authentication service for Asset Vision
 * Handles user authentication, token management, and session persistence
 */
class AuthService {
  private static instance: AuthService;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login user and store authentication tokens
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.login(email, password);
      this.setTokens(response.token, response.refreshToken);
      this.setupTokenRefresh();
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user and authenticate
   */
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await authApi.register({ name, email, password });
      this.setTokens(response.token, response.refreshToken);
      this.setupTokenRefresh();
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
   * Logout user and clear tokens from both cookies and localStorage
   */
  logout(): void {
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
   * Store authentication tokens in HTTP-only cookies
   * This is more secure than localStorage as it prevents XSS attacks
   */
  private setTokens(token: string, refreshToken: string): void {
    // For development, we'll set cookies that can be accessed by JavaScript
    // In production, these would be set by the server as HTTP-only cookies
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60}; SameSite=Strict`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
    
    // Also store in localStorage for client-side access (will be removed in production)
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Set up automatic token refresh
   */
  private setupTokenRefresh(): void {
    // Clear any existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Refresh token 5 minutes before expiration (assuming 1 hour token lifetime)
    const refreshTime = 55 * 60 * 1000; // 55 minutes
    
    this.tokenRefreshTimer = setTimeout(async () => {
      try {
        const response = await authApi.refreshToken();
        this.setTokens(response.token, response.refreshToken);
        this.setupTokenRefresh(); // Set up the next refresh
      } catch (error) {
        console.error('Token refresh failed:', error);
        this.logout(); // Force logout on refresh failure
      }
    }, refreshTime);
  }
}

export const authService = AuthService.getInstance();
