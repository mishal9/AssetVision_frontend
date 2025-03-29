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
   * Logout user and clear tokens
   */
  logout(): void {
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
   */
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  /**
   * Store authentication tokens in localStorage
   */
  private setTokens(token: string, refreshToken: string): void {
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
