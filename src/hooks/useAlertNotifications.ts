/**
 * Hook for managing alert notifications
 * Periodically checks for new alert history and creates notifications
 */

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store';
import { alertsApi } from '@/services/alerts-api';
import { createAlertNotification } from '@/services/notifications';
import { AlertHistory } from '@/types/alerts';

/**
 * Hook to monitor alert history and create notifications
 */
export const useAlertNotifications = () => {
  const dispatch = useAppDispatch();
  const lastCheckedRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for new alert history entries
  const checkForNewAlerts = async () => {
    try {
      // Get all alert history
      const history = await alertsApi.getAlertHistory();
      
      if (!history || history.length === 0) {
        return;
      }

      // Sort by triggered date, newest first
      const sortedHistory = history.sort((a, b) => 
        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
      );

      // If this is the first check, just set the last checked time
      if (!lastCheckedRef.current) {
        lastCheckedRef.current = sortedHistory[0]?.triggeredAt || new Date().toISOString();
        return;
      }

      // Find new history entries since last check
      const newEntries = sortedHistory.filter(entry => 
        entry.triggeredAt > lastCheckedRef.current! && entry.wasTriggered
      );

      // Create notifications for new triggered alerts
      for (const entry of newEntries) {
        try {
          // Get the alert rule details
          const alertRule = await alertsApi.getAlertRule(entry.alertRuleId);
          
          // Create notification
          await createAlertNotification(alertRule, entry);
          
        } catch (error) {
          console.error(`Failed to create notification for alert ${entry.alertRuleId}:`, error);
        }
      }

      // Update last checked time
      if (sortedHistory.length > 0) {
        lastCheckedRef.current = sortedHistory[0].triggeredAt;
      }

    } catch (error) {
      console.error('Failed to check for new alerts:', error);
    }
  };

  // Start monitoring
  const startMonitoring = () => {
    // Initial check
    checkForNewAlerts();
    
    // Set up periodic checking (every 30 seconds)
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

  return {
    checkForNewAlerts,
    startMonitoring,
    stopMonitoring,
  };
};

// Removed demo notifications hook - notifications now come from real alert triggers only
