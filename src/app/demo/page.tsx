'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

/**
 * Demo Entry Point Component
 * Simple redirect to demo dashboard with loading state
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    // Set demo mode flag in sessionStorage
    sessionStorage.setItem('demo_mode', 'true');
    
    // Create basic demo session data
    const sessionData = {
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      user: {
        id: 999999,
        username: 'demo_user',
        email: 'demo@alphaoptimize.com',
        avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=4f46e5&color=fff',
      }
    };
    
    sessionStorage.setItem('demo_session', JSON.stringify(sessionData));
    
    // Short delay for better UX, then redirect
    const timer = setTimeout(() => {
      router.push('/demo/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center">
      <Card className="p-8 max-w-md mx-auto">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-xl font-semibold mb-2">Setting up your demo...</h3>
          <p className="text-muted-foreground mb-4">
            Creating isolated workspace with portfolio data
          </p>
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Generating demo portfolio ($212,500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Loading market data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Initializing AI assistant</span>
            </div>
          </div>
            </div>
          </Card>
    </div>
  );
}