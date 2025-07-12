'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { useRef } from 'react';

/**
 * Redux provider with proper Next.js App Router support
 * This ensures the store is properly initialized for client components
 * and prevents hydration mismatches between server and client
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  // Create a ref to store the Redux store to ensure it's not recreated on re-renders
  const storeRef = useRef(store);
  
  return (
    <Provider store={storeRef.current}>
      {children}
    </Provider>
  );
}
