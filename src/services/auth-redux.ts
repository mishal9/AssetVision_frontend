/**
 * Redux integration for authentication service
 * This file connects the auth service with Redux state management
 */

import { authService } from './auth';
import { store } from '@/store';
import { clearUser, fetchUserInfo, setUser } from '@/store/userSlice';
import { UserInfoResponse } from '../types/auth';

/**
 * Initialize authentication state from stored tokens
 * Should be called when the application starts
 */
export const initAuthState = async (): Promise<void> => {
  if (authService.isAuthenticated()) {
    try {
      // Dispatch the async thunk to fetch user info
      await store.dispatch(fetchUserInfo()).unwrap();
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
      // If fetching user info fails, clear authentication state
      store.dispatch(clearUser());
    }
  }
};

/**
 * Update Redux state after successful login
 */
export const updateAuthStateAfterLogin = (userData: UserInfoResponse): void => {
  if (userData) {
    store.dispatch(
      setUser({
        id: userData.userId,
        username: userData.username,
        email: userData.email,
        // Generate avatar from initials if no avatar URL is provided
        avatar: userData.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=random`,
      })
    );
  }
};

/**
 * Clear Redux state after logout
 */
export const clearAuthState = (): void => {
  store.dispatch(clearUser());
};
