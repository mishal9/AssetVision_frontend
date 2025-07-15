'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { portfolioApi } from '@/services/api';
import PortfolioDriftContainer from '@/components/portfolio/PortfolioDriftContainer';

/**
 * Portfolio Drift page component
 * Displays portfolio drift visualization
 */
export default function PortfolioDriftPage() {
  const router = useRouter();
  
  // Check if user has a portfolio
  useEffect(() => {
    async function checkPortfolio() {
      try {
        const hasExistingPortfolio = await portfolioApi.hasPortfolio();
        if (!hasExistingPortfolio) {
          // Redirect to dashboard if no portfolio exists
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking portfolio status:', error);
        router.push('/dashboard');
      }
    }
    
    checkPortfolio();
  }, [router]);

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
          <PortfolioDriftContainer />
        </div>
        
      </div>
    </div>
  );
}
