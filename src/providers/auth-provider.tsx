'use client';

import { useEffect } from 'react';
import { initAuthState } from '@/services/auth-redux';

/**
 * Authentication Provider Component
 * Initializes authentication state on application load
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize authentication state when the component mounts
    initAuthState().catch(error => {
      console.error('Failed to initialize authentication state:', error);
    });
  }, []);

  return <>{children}</>;
}
