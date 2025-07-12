'use client';

import { useEffect, useState } from 'react';

/**
 * ClientOnly component wrapper
 * 
 * This component ensures that its children are only rendered on the client side
 * and not during server-side rendering. This is useful for components that use
 * browser APIs or React hooks that are not compatible with SSR.
 * 
 * @param children - The components to render on the client side
 * @returns The wrapped components, only rendered on the client
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
