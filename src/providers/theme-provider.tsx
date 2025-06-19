'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Only supports light mode
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Always set to light theme
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return <>{children}</>;
}
