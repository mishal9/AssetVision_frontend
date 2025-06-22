"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading component for the Portfolio Drift page
 * Displays a loading skeleton while the page content loads
 */
export default function PortfolioDriftLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="bg-card border border-border rounded-lg p-6">
          <Skeleton className="h-7 w-48 mb-6" />
          
          {/* Drift visualization skeleton */}
          <div className="space-y-8">
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
            
            <div className="space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="flex flex-col space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-5 w-24" />
                    <div className="w-full">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Explanation box skeleton */}
        <div className="mt-8 p-4 border border-muted-foreground/20 bg-muted/20 rounded-lg">
          <Skeleton className="h-6 w-40 mb-2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
