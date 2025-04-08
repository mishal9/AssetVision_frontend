'use client';

import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAppSelector } from '@/store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Simplified to use Redux as the single source of truth for the theme
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const reduxTheme = useAppSelector((state) => state.app.theme);
  
  // Apply theme directly to document
  useEffect(() => {
    if (reduxTheme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(reduxTheme);
    }
  }, [reduxTheme]);

  return (
    <NextThemeProvider
      attribute="class"
      value={{ light: 'light', dark: 'dark' }}
      defaultTheme={reduxTheme}
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme={reduxTheme} // Always force the theme from Redux
    >
      {children}
    </NextThemeProvider>
  );
}
