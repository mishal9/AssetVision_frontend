'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';

/**
 * Root page component
 * Checks if user is authenticated and redirects accordingly:
 * - If authenticated, redirects to dashboard
 * - If not authenticated, redirects to login page
 */
export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    // Redirect based on authentication status
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);
  
  // Return a loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold mb-2">Asset Vision</h2>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
