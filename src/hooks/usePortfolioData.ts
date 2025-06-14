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
  // Portfolio existence state
  const [portfolioExists, setPortfolioExists] = useState<boolean | null>(null);
  
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
  
  // Alerts data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  
  // Fetch portfolio summary and check if portfolio exists
  useEffect(() => {
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        const data = await portfolioApi.getPortfolioSummary();
        setSummary(data);
        setSummaryError(null);
        setPortfolioExists(true);
      } catch (error: any) {
        console.error('Error fetching portfolio summary:', error);
        // Check for 404 specifically to determine portfolio doesn't exist
        if (error?.status === 404 || error?.message?.includes('404')) {
          setPortfolioExists(false);
        }
        setSummaryError('Failed to load portfolio summary');
      } finally {
        setSummaryLoading(false);
      }
    }
    
    fetchSummary();
  }, []);
  
  // Fetch performance data only if portfolio exists
  useEffect(() => {
    async function fetchPerformance() {
      if (portfolioExists !== true) {
        return;
      }
      
      try {
        setPerformanceLoading(true);
        // Fetch all performance data at once to avoid reloading when changing periods
        const data = await portfolioApi.getPerformance('all');
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
  }, [portfolioExists]);
  
  // Fetch asset allocation only if portfolio exists
  useEffect(() => {
    async function fetchAllocation() {
      if (portfolioExists !== true) {
        return;
      }
      
      try {
        setAllocationLoading(true);
        const data = await portfolioApi.getAssetAllocation();
        
        // Check the structure of the response
        if (data && data.asset_allocation && Array.isArray(data.asset_allocation)) {
          setAssetAllocation(data.asset_allocation);
        } else if (data && data.assetAllocation && Array.isArray(data.assetAllocation)) {
          setAssetAllocation(data.assetAllocation);
        } else {
          console.error('Invalid asset_allocation data structure:', data);
          setAssetAllocation([]);
        }
        
        // Check for sector allocation
        if (data && data.sector_allocation && Array.isArray(data.sector_allocation)) {
          setSectorAllocation(data.sector_allocation);
        } else if (data && data.sectorAllocation && Array.isArray(data.sectorAllocation)) {
          setSectorAllocation(data.sectorAllocation);
        } else {
          console.error('Invalid sector_allocation data structure:', data);
          setSectorAllocation([]);
        }
        
        setAllocationError(null);
      } catch (error) {
        console.error('Error fetching asset allocation:', error);
        setAllocationError('Failed to load asset allocation');
      } finally {
        setAllocationLoading(false);
      }
    }
    
    fetchAllocation();
  }, [portfolioExists]);
  

  
  // Fetch alerts only if portfolio exists
  useEffect(() => {
    async function fetchAlerts() {
      // Still fetch alerts even without portfolio, as there might be system alerts
      // But we could add a check here if alerts are strictly portfolio-related
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
    setAlertsLoading(true);
    
    // Always check portfolio summary first
    portfolioApi.getPortfolioSummary().then(data => {
      setSummary(data);
      setSummaryError(null);
      setPortfolioExists(true);
      
      // Portfolio exists, prepare to refresh the other data
      setPerformanceLoading(true);
      setAllocationLoading(true);
    }).catch(error => {
      console.error('Error refreshing portfolio summary:', error);
      setSummaryError('Failed to refresh portfolio summary');
      
      // Check if portfolio doesn't exist
      if (error?.status === 404 || error?.message?.includes('404')) {
        setPortfolioExists(false);
      }
    }).finally(() => {
      setSummaryLoading(false);
    });
    
    // Only fetch performance data if portfolio exists
    if (portfolioExists === true) {
      portfolioApi.getPerformance('all').then(data => {
        setPerformance(data);
        setPerformanceError(null);
      }).catch(error => {
        console.error('Error refreshing performance data:', error);
        setPerformanceError('Failed to refresh performance data');
      }).finally(() => {
        setPerformanceLoading(false);
      });
    }
    
    // Only fetch allocation data if portfolio exists
    if (portfolioExists === true) {
      portfolioApi.getAssetAllocation().then(data => {
      // Handle asset allocation
      if (data && data.asset_allocation && Array.isArray(data.asset_allocation)) {
        setAssetAllocation(data.asset_allocation);
      } else if (data && data.assetAllocation && Array.isArray(data.assetAllocation)) {
        setAssetAllocation(data.assetAllocation);
      } else {
        console.error('Invalid asset_allocation data structure (refresh):', data);
        setAssetAllocation([]);
      }
      
      // Handle sector allocation
      if (data && data.sector_allocation && Array.isArray(data.sector_allocation)) {
        setSectorAllocation(data.sector_allocation);
      } else if (data && data.sectorAllocation && Array.isArray(data.sectorAllocation)) {
        setSectorAllocation(data.sectorAllocation);
      } else {
        console.error('Invalid sector_allocation data structure (refresh):', data);
        setSectorAllocation([]);
      }
      
      setAllocationError(null);
    }).catch(error => {
      console.error('Error refreshing asset allocation:', error);
      setAllocationError('Failed to refresh asset allocation');
    }).finally(() => {
      setAllocationLoading(false);
    });
    }
    

    
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
    alerts,
    alertsLoading,
    alertsError,
    refreshData,
    isLoading: summaryLoading || performanceLoading || allocationLoading || alertsLoading,
    hasError: !!summaryError || !!performanceError || !!allocationError || !!alertsError
  };
}
