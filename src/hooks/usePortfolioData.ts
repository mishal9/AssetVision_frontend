'use client';

import { useState, useEffect } from 'react';
import { portfolioApi, PortfolioSummary, PerformanceData, AssetAllocation, AllocationResponse } from '@/services/api';
import { alertsApi, Alert } from '@/services/api';

/**
 * Custom hook for fetching portfolio data
 * Handles loading states, error handling, and data fetching
 * @returns Portfolio data, loading states, and error states
 */
export function usePortfolioData() {
  // Portfolio summary data
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // Performance data
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState<boolean>(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  
  // Asset allocation data
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [sectorAllocation, setSectorAllocation] = useState<AssetAllocation[]>([]);
  const [allocationLoading, setAllocationLoading] = useState<boolean>(true);
  const [allocationError, setAllocationError] = useState<string | null>(null);
  
  // Dividend yield
  const [dividendYield, setDividendYield] = useState<number | null>(null);
  const [dividendYieldLoading, setDividendYieldLoading] = useState<boolean>(true);
  const [dividendYieldError, setDividendYieldError] = useState<string | null>(null);
  
  // Alerts data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  
  // Fetch portfolio summary
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        const data = await portfolioApi.getPortfolioSummary();
        setSummary(data);
        setSummaryError(null);
      } catch (error) {
        console.error('Error fetching portfolio summary:', error);
        setSummaryError('Failed to load portfolio summary');
      } finally {
        setSummaryLoading(false);
      }
    }
    
    fetchSummary();
  }, []);
  
  // Fetch performance data
  useEffect(() => {
    async function fetchPerformance() {
      try {
        setPerformanceLoading(true);
        const data = await portfolioApi.getPerformance('month');
        setPerformance(data);
        setPerformanceError(null);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        setPerformanceError('Failed to load performance data');
      } finally {
        setPerformanceLoading(false);
      }
    }
    
    fetchPerformance();
  }, []);
  
  // Fetch asset allocation
  useEffect(() => {
    async function fetchAllocation() {
      try {
        setAllocationLoading(true);
        const data = await portfolioApi.getAssetAllocation();
        setAssetAllocation(data.asset_allocation);
        setSectorAllocation(data.sector_allocation);
        setAllocationError(null);
      } catch (error) {
        console.error('Error fetching asset allocation:', error);
        setAllocationError('Failed to load asset allocation');
      } finally {
        setAllocationLoading(false);
      }
    }
    
    fetchAllocation();
  }, []);
  
  // Fetch dividend yield
  useEffect(() => {
    async function fetchDividendYield() {
      try {
        setDividendYieldLoading(true);
        const data = await portfolioApi.getDividendYield();
        setDividendYield(data.yield);
        setDividendYieldError(null);
      } catch (error) {
        console.error('Error fetching dividend yield:', error);
        setDividendYieldError('Failed to load dividend yield');
      } finally {
        setDividendYieldLoading(false);
      }
    }
    
    fetchDividendYield();
  }, []);
  
  // Fetch alerts
  useEffect(() => {
    async function fetchAlerts() {
      try {
        setAlertsLoading(true);
        const data = await alertsApi.getAlerts();
        setAlerts(data);
        setAlertsError(null);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setAlertsError('Failed to load alerts');
      } finally {
        setAlertsLoading(false);
      }
    }
    
    fetchAlerts();
  }, []);
  
  // Function to refresh all data
  const refreshData = () => {
    // Reset loading states
    setSummaryLoading(true);
    setPerformanceLoading(true);
    setAllocationLoading(true);
    setAlertsLoading(true);
    
    // Fetch all data again
    portfolioApi.getPortfolioSummary().then(data => {
      setSummary(data);
      setSummaryError(null);
    }).catch(error => {
      console.error('Error refreshing portfolio summary:', error);
      setSummaryError('Failed to refresh portfolio summary');
    }).finally(() => {
      setSummaryLoading(false);
    });
    
    portfolioApi.getPerformance('month').then(data => {
      setPerformance(data);
      setPerformanceError(null);
    }).catch(error => {
      console.error('Error refreshing performance data:', error);
      setPerformanceError('Failed to refresh performance data');
    }).finally(() => {
      setPerformanceLoading(false);
    });
    
    portfolioApi.getAssetAllocation().then(data => {
      setAssetAllocation(data.asset_allocation);
      setSectorAllocation(data.sector_allocation);
      setAllocationError(null);
    }).catch(error => {
      console.error('Error refreshing asset allocation:', error);
      setAllocationError('Failed to refresh asset allocation');
    }).finally(() => {
      setAllocationLoading(false);
    });
    
    portfolioApi.getDividendYield().then(data => {
      setDividendYield(data.yield);
      setDividendYieldError(null);
    }).catch(error => {
      console.error('Error refreshing dividend yield:', error);
      setDividendYieldError('Failed to refresh dividend yield');
    }).finally(() => {
      setDividendYieldLoading(false);
    });
    
    alertsApi.getAlerts().then(data => {
      setAlerts(data);
      setAlertsError(null);
    }).catch(error => {
      console.error('Error refreshing alerts:', error);
      setAlertsError('Failed to refresh alerts');
    }).finally(() => {
      setAlertsLoading(false);
    });
  };
  
  return {
    summary,
    summaryLoading,
    summaryError,
    performance,
    performanceLoading,
    performanceError,
    assetAllocation,
    sectorAllocation,
    allocationLoading,
    allocationError,
    dividendYield,
    dividendYieldLoading,
    dividendYieldError,
    alerts,
    alertsLoading,
    alertsError,
    refreshData,
    isLoading: summaryLoading || performanceLoading || allocationLoading || dividendYieldLoading || alertsLoading,
    hasError: !!summaryError || !!performanceError || !!allocationError || !!dividendYieldError || !!alertsError
  };
}
