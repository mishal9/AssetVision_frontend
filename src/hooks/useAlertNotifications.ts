/**
 * Hook for managing alert notifications
 * Periodically checks for new alert history and creates notifications
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store';
import { notificationService } from '@/services/notificationService';

/**
 * Hook to monitor alert history and create notifications
 */
export const useAlertNotifications = () => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for new alert triggers using the efficient service
  const checkForNewAlerts = async () => {
    try {
      await notificationService.checkForNewAlerts();
    } catch (error) {
      console.error('Failed to check for new alerts:', error);
    }
  };

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
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
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
