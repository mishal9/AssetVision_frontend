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

/**
 * Hook to create demo notifications (for testing)
 */
export const useDemoNotifications = () => {
  const dispatch = useAppDispatch();

  const createDemoNotifications = async () => {
    const { createNotification } = await import('@/store/notificationsSlice');
    const { NotificationType, NotificationPriority } = await import('@/types/notifications');

    // Demo notifications
    const demoNotifications = [
      {
        type: NotificationType.PORTFOLIO_DRIFT,
        priority: NotificationPriority.HIGH,
        title: 'Portfolio Drift Alert',
        message: 'Your technology sector allocation has drifted 12% from target allocation.',
        alertId: 'demo-1',
        portfolioId: 'demo-portfolio',
        actionUrl: '/dashboard/alerts/demo-1',
        actionLabel: 'View Alert Details',
        data: { sector: 'technology', drift: 12 },
      },
      {
        type: NotificationType.PRICE_MOVEMENT,
        priority: NotificationPriority.NORMAL,
        title: 'Price Movement Alert',
        message: 'AAPL has moved 5.2% in the last hour.',
        alertId: 'demo-2',
        actionUrl: '/dashboard/alerts/demo-2',
        actionLabel: 'View Details',
        data: { symbol: 'AAPL', movement: 5.2 },
      },
      {
        type: NotificationType.ALERT_RESOLVED,
        priority: NotificationPriority.LOW,
        title: 'Alert Resolved',
        message: 'Cash idle alert has been resolved after recent investment.',
        alertId: 'demo-3',
        actionUrl: '/dashboard/alerts/demo-3',
        actionLabel: 'View Alert',
      },
    ];

    // Create demo notifications with delays
    for (let i = 0; i < demoNotifications.length; i++) {
      setTimeout(() => {
        dispatch(createNotification(demoNotifications[i]));
      }, i * 1000);
    }
  };

  return { createDemoNotifications };
};
