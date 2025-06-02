'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { socketService } from '@/services/websocket';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PortfolioSetup } from '@/components/dashboard/portfolio-setup';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { SectorAllocationChart } from '@/components/dashboard/sector-allocation-chart';
import { BarChart3, Users, TrendingUp, Activity, PieChart, Bell, DollarSign } from 'lucide-react';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { portfolioApi } from '@/services/api';

/**
 * Dashboard page component
 * Displays portfolio overview, performance charts, and alerts
 * If user has no portfolio, shows portfolio setup component
 */
export default function DashboardPage() {
  const router = useRouter();
  const [hasPortfolio, setHasPortfolio] = useState<boolean | null>(null);
  const { 
    summary, 
    summaryLoading, 
    performance, 
    performanceLoading, 
    assetAllocation, 
    sectorAllocation, 
    allocationLoading,
    alerts, 
    alertsLoading,
    refreshData
  } = usePortfolioData();
  
  // Check if user has a portfolio
  useEffect(() => {
    async function checkPortfolio() {
      try {
        const hasExistingPortfolio = await portfolioApi.hasPortfolio();
        setHasPortfolio(hasExistingPortfolio);
      } catch (error) {
        console.error('Error checking portfolio status:', error);
        setHasPortfolio(false);
      }
    }
    
    checkPortfolio();
  }, []);
  
  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    socketService.connect();
    
    // Cleanup WebSocket connection on unmount
    return () => socketService.disconnect();
  }, []);

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Handle portfolio creation
  const handlePortfolioCreated = () => {
    setHasPortfolio(true);
    refreshData();
  };
  
  // Show loading state while checking portfolio status
  if (hasPortfolio === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }
  
  // Show portfolio setup if user has no portfolio
  if (hasPortfolio === false) {
    return <PortfolioSetup onPortfolioCreated={handlePortfolioCreated} />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {summaryLoading ? (
            // Loading skeleton for stats cards
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="rounded-xl bg-card p-6 shadow-sm border border-border animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              ))}
            </>
          ) : summary ? (
            // Actual stats cards with data
            <>
              <StatsCard 
                title="Total Portfolio Value" 
                value={formatCurrency(summary.totalValue)} 
                change={formatPercentage(summary.totalGainPercentage)} 
                icon={<BarChart3 className="h-5 w-5" />} 
              />
              <StatsCard 
                title="Cash Balance" 
                value={formatCurrency(summary.cashBalance)} 
                change="Available" 
                icon={<Users className="h-5 w-5" />} 
              />
              <StatsCard 
                title="Total Gain" 
                value={formatCurrency(summary.totalGain)} 
                change={formatPercentage(summary.totalGainPercentage)} 
                icon={<TrendingUp className="h-5 w-5" />} 
              />
              <StatsCard 
                title="Day Change" 
                value={formatCurrency(summary.dayChange)} 
                change={formatPercentage(summary.dayChangePercentage)} 
                icon={<Activity className="h-5 w-5" />} 
              />
              <StatsCard 
                title="Dividend Yield" 
                value={summary.dividend_yield !== undefined ? `${summary.dividend_yield.toFixed(2)}%` : 'N/A'} 
                change="Annual" 
                icon={<DollarSign className="h-5 w-5" />} 
              />
            </>
          ) : (
            // Error state
            <div className="col-span-4 p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400">Failed to load portfolio data</p>
            </div>
          )}
        </div>

        {/* Portfolio Performance Chart */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
          {performanceLoading ? (
            // Loading skeleton for chart
            <div className="h-64 animate-pulse bg-muted rounded"></div>
          ) : performance && performance.length > 0 ? (
            // Render the performance chart component
            <PerformanceChart data={performance} />
          ) : (
            // Error or no data state
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No performance data available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Allocation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Asset Allocation</h2>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {allocationLoading ? (
              // Loading skeleton for allocation
              <div className="h-64 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-32 w-32 rounded-full bg-muted"></div>
                  <div className="flex-1 ml-4 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-6 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : assetAllocation && assetAllocation.length > 0 ? (
              // Render the asset allocation chart component
              <SectorAllocationChart data={assetAllocation} />
            ) : (
              // Error or no data state
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No allocation data available</p>
              </div>
            )}
          </div>
          
          {/* Sector Allocation */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Sector Allocation</h2>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
            
            {allocationLoading ? (
              // Loading skeleton for sector allocation
              <div className="h-64 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-32 w-32 rounded-full bg-muted"></div>
                  <div className="flex-1 ml-4 space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-6 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            ) : sectorAllocation && sectorAllocation.length > 0 ? (
              // Render the sector allocation chart component
              <SectorAllocationChart data={sectorAllocation} />
            ) : (
              // Error or no data state
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">No sector allocation data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
