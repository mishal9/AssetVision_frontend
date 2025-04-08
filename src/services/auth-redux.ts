/**
 * Redux integration for authentication service
 * This file connects the auth service with Redux state management
 */

import { authService } from './auth';
import { store } from '@/store';
import { clearUser, fetchUserInfo, setUser } from '@/store/userSlice';
import { UserInfoResponse } from './api';

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
  if (userData && userData.user) {
    store.dispatch(
      setUser({
        id: userData.user.id,
        username: userData.user.username,
        email: userData.user.email,
        // Generate avatar from initials if no avatar URL is provided
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.user.username)}&background=random`,
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
