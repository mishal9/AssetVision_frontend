'use client';

import { Suspense } from 'react';
import PortfolioDriftContainer from '@/components/portfolio/PortfolioDriftContainer';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Portfolio Drift page component
 * Displays portfolio drift visualization with optimized loading
 */
export default function PortfolioDriftPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Portfolio Drift Analysis</h1>
        </div>
        
        {/* Info section explaining portfolio drift */}
        <div className="mb-8 p-4 border border-muted-foreground/20 bg-muted/20 rounded-lg">
          <h3 className="font-medium mb-2">What is Portfolio Drift?</h3>
          <p className="text-sm text-muted-foreground">
            Portfolio drift occurs when your actual sector allocation deviates from your target sector allocation due to 
            market performance differences. Regular rebalancing helps maintain your desired risk profile and investment strategy.
            This visualization shows how far each sector has drifted from its target, helping you identify when rebalancing may be needed.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <Suspense fallback={<PortfolioDriftSkeleton />}>
            <PortfolioDriftContainer />
          </Suspense>
        </div>
        
      </div>
    </div>
  );
}

/**
 * Loading skeleton for portfolio drift content
 */
function PortfolioDriftSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      {/* Drift visualization skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36" />
        <div className="flex flex-col space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-5 w-24" />
              <div className="w-full">
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Alerts section skeleton */}
      <div className="mt-10 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
