/**
 * Custom hook for managing portfolio drift data with caching and optimization
 * Provides centralized data management for portfolio drift functionality
 */

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '@/store';
import { fetchPortfolioDrift, fetchAssetClasses, fetchSectors, AssetClass, Sector } from '@/store/portfolioSlice';
import { portfolioApi } from '@/services/api';
import { DriftResponse } from '@/types/portfolio';

interface UsePortfolioDriftOptions {
  autoLoad?: boolean;
  cacheDuration?: number;
  enablePrefetch?: boolean;
}

import { DriftResponse } from '@/types/portfolio';
import { AssetClass, Sector } from '@/store/portfolioSlice';

interface UsePortfolioDriftReturn {
  // Data
  driftData: DriftResponse | null;
  currentAllocations: {
    asset_class?: Record<string, number>;
    sector?: Record<string, number>;
  };
  assetClasses: AssetClass[];
  sectors: Sector[];
  
  // Loading states
  driftLoading: boolean;
  assetClassesLoading: boolean;
  sectorsLoading: boolean;
  isInitialized: boolean;
  isInitializing: boolean;
  
  // Error states
  driftError: string | null;
  driftSetupRequired: boolean;
  driftSetupMessage: string | null;
  
  // Actions
  refresh: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
  
  // Computed values
  hasData: boolean;
  lastFetchTime: number;
}

export function usePortfolioDrift(options: UsePortfolioDriftOptions = {}): UsePortfolioDriftReturn {
  const {
    autoLoad = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
    enablePrefetch = true
  } = options;

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const {
    driftData,
    driftLoading,
    driftError,
    driftSetupRequired,
    driftSetupMessage,
    currentAllocations,
    assetClasses,
    assetClassesLoading,
    sectors,
    sectorsLoading
  } = useSelector((state: RootState) => state.portfolio);

  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const hasLoadedRef = useRef(false);

  // Memoized computed values
  const hasData = useMemo(() => {
    return !!(driftData?.overall || driftData?.asset_class || driftData?.sector);
  }, [driftData]);

  // Cache invalidation
  const invalidateCache = useCallback(() => {
    setLastFetchTime(0);
    setIsInitialized(false);
    setIsInitializing(false);
    hasLoadedRef.current = false;
  }, []);

  // Main data loading function with caching
  const loadData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    const shouldUseCache = !forceRefresh && (now - lastFetchTime) < cacheDuration;
    
    // Prevent duplicate loading
    if (hasLoadedRef.current && !forceRefresh) {
      return;
    }
    
    // Check cache using driftData directly instead of hasData to avoid circular dependency
    if (shouldUseCache && isInitialized && (driftData?.overall || driftData?.asset_class || driftData?.sector)) {
      return;
    }
    
    try {
      setIsInitializing(true);
      hasLoadedRef.current = true;
      
      // Check portfolio existence first
      const hasPortfolio = await portfolioApi.hasPortfolio();
      if (!hasPortfolio) {
        router.push('/dashboard');
        return;
      }
      
      // Get portfolio ID (for future use if needed)
      try {
        await portfolioApi.getActivePortfolioId();
      } catch {
        // Could not get active portfolio ID, using default
      }
      
      // Parallel data loading for optimal performance
      const promises = [
        dispatch(fetchPortfolioDrift()).unwrap()
      ];
      
      // Prefetch asset classes and sectors if enabled
      if (enablePrefetch) {
        promises.push(
          dispatch(fetchAssetClasses()).unwrap(),
          dispatch(fetchSectors()).unwrap()
        );
      }
      
      const results = await Promise.allSettled(promises);
      
      // Check if drift data was successfully loaded
      const driftResult = results[0];
      if (driftResult.status === 'fulfilled') {
        setLastFetchTime(now);
        setIsInitialized(true);
      } else {
        hasLoadedRef.current = false; // Reset on error
      }
    } catch {
      hasLoadedRef.current = false; // Reset on error
    } finally {
      setIsInitializing(false);
    }
  }, [
    dispatch,
    router,
    lastFetchTime,
    cacheDuration,
    enablePrefetch
  ]);

  // Refresh function
  const refresh = useCallback(async (force = false) => {
    await loadData(force);
  }, [loadData]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  // Return hook interface
  return {
    // Data
    driftData,
    currentAllocations,
    assetClasses,
    sectors,
    
    // Loading states
    driftLoading,
    assetClassesLoading,
    sectorsLoading,
    isInitialized,
    isInitializing,
    
    // Error states
    driftError,
    driftSetupRequired,
    driftSetupMessage,
    
    // Actions
    refresh,
    invalidateCache,
    
    // Computed values
    hasData,
    lastFetchTime
  };
}
