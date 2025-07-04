'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { socketService } from '@/services/websocket';
import { StatsCard } from '@/components/dashboard/stats-card';
import { PortfolioSetup } from '@/components/dashboard/portfolio-setup';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { SectorAllocationChart } from '@/components/dashboard/sector-allocation-chart';
import PortfolioInsightsGemini from '@/components/portfolio/PortfolioInsightsGemini';
import { BarChart3, Users, TrendingUp, Activity, PieChart, Bell, DollarSign, Lightbulb } from 'lucide-react';
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
    const connectWebSocket = async () => {
      try {
        console.log('Connecting to WebSocket...');
        // Get the access token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        await socketService.connect(undefined, token || undefined);
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Set up connection status listener
    const unsubscribe = socketService.onConnectionChange((connected) => {
      console.log('WebSocket connection status:', connected ? 'connected' : 'disconnected');
      if (!connected) {
        // Attempt to reconnect after a delay
        setTimeout(connectWebSocket, 5000);
      }
    });
    
    // Cleanup WebSocket connection on unmount
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);

  // Format currency values
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage values
  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0.00%';
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
                value={summary.dividendYield !== undefined ? `${summary.dividendYield.toFixed(2)}%` : '0.00%'} 
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
            // Render the performance chart component with current portfolio value
            <PerformanceChart 
              data={performance} 
              currentValue={summary?.totalValue} 
            />
          ) : (
            // Error or no data state
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No performance data available</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        
        {/* AI Portfolio Insights using Gemini */}
        <div className="bg-card border border-border rounded-lg mb-8">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold">AI Portfolio Insights</h2>
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <div className="p-6">
            {summary ? (
              <PortfolioInsightsGemini portfolioData={{
                total_value: summary.totalValue,
                total_cost: summary.totalCost || summary.totalValue * 0.8, // Fallback if totalCost is missing
                total_gain: summary.totalGain,
                total_gain_percentage: summary.totalGainPercentage,
                day_change: summary.dayChange,
                day_change_percentage: summary.dayChangePercentage,
                dividend_yield: summary.dividendYield,
                asset_allocation: summary.assetAllocation || {
                  equity: assetAllocation?.find(a => a.name === "Equity")?.value || 0,
                  bond: assetAllocation?.find(a => a.name === "Bond")?.value || 0,
                  cash: assetAllocation?.find(a => a.name === "Cash")?.value || 0,
                  alternative: assetAllocation?.find(a => a.name === "Alternative")?.value || 0,
                  crypto: assetAllocation?.find(a => a.name === "Crypto")?.value || 0,
                  real_estate: assetAllocation?.find(a => a.name === "Real Estate")?.value || 0,
                  commodity: assetAllocation?.find(a => a.name === "Commodity")?.value || 0,
                  unknown: assetAllocation?.find(a => a.name === "Unknown")?.value || 0
                },
                sector_allocation: Object.fromEntries(
                  (sectorAllocation || []).map(item => [item.name, item.value])
                ),
                performance: summary.performance || {
                  one_year: 15,
                  three_year: 45,
                  five_year: 75,
                  ytd: 8,
                  total_return: summary.totalGainPercentage
                }
              }} />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-muted-foreground">No portfolio data available for AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
