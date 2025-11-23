/**
 * Hook for managing alert notifications
 * Periodically checks for new alert history and creates notifications
 */

import { useEffect, useRef, useCallback } from 'react';
import { notificationService } from '@/services/notificationService';

/**
 * Hook to monitor alert history and create notifications
 */
export const useAlertNotifications = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  // Check for new alert triggers using the efficient service
  const checkForNewAlerts = useCallback(async () => {
    try {
      await notificationService.checkForNewAlerts();
    } catch (error) {
      // Error handling - could be logged to error tracking service in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to check for new alerts:', error);
      }
    }
  }, []);

  // Start monitoring
  const startMonitoring = () => {
    // Initial check
    checkForNewAlerts();
    
    // Set up periodic checking (every 30 seconds - more efficient)
    intervalRef.current = setInterval(checkForNewAlerts, 30000);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Set up monitoring on mount and cleanup on unmount
  useEffect(() => {
    // Prevent duplicate initialization in React Strict Mode
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;
    
    startMonitoring();
    
    return () => {
      stopMonitoring();
      // Don't reset hasStartedRef here - it should persist across Strict Mode double-invocation
      // Only reset when component actually unmounts (which would require a different approach)
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual refresh function for immediate checking
  const refreshNotifications = async () => {
    await notificationService.forceRefresh();
  };

  return {
    checkForNewAlerts,
    refreshNotifications,
    startMonitoring,
    stopMonitoring,
  };
};

// Removed demo notifications hook - notifications now come from real alert triggers only
