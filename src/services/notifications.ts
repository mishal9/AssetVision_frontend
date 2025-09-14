/**
 * Notification service for creating and managing alert notifications
 */

import { store } from '@/store';
import { createNotification } from '@/store/notificationsSlice';
import { NotificationType, NotificationPriority } from '@/types/notifications';
import { AlertRule, AlertHistory } from '@/types/alerts';
import { toast } from 'sonner';

/**
 * Create a notification for an alert trigger
 */
export const createAlertNotification = async (alert: AlertRule, history?: AlertHistory) => {
  const notificationType = getNotificationTypeFromAlert(alert);
  const priority = getNotificationPriorityFromAlert(alert);
  
  const notification = {
    type: notificationType,
    priority,
    title: `Alert Triggered: ${alert.name}`,
    message: getAlertMessage(alert, history),
    alertId: alert.id,
    portfolioId: alert.portfolioId,
    actionUrl: `/dashboard/alerts/${alert.id}`,
    actionLabel: 'View Alert Details',
    data: {
      alertType: alert.conditionType,
      alertConfig: alert.conditionConfig,
      historyId: history?.id,
    },
  };

  // Add to notification store
  store.dispatch(createNotification(notification));

  // Also show toast notification for immediate feedback
  const toastMessage = `${alert.name}: ${getShortAlertMessage(alert)}`;
  
  switch (priority) {
    case NotificationPriority.URGENT:
      toast.error(toastMessage, {
        duration: 10000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/dashboard/alerts/${alert.id}`,
        },
      });
      break;
    case NotificationPriority.HIGH:
      toast.warning(toastMessage, {
        duration: 8000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/dashboard/alerts/${alert.id}`,
        },
      });
      break;
    default:
      toast.info(toastMessage, {
        duration: 6000,
        action: {
          label: 'View',
          onClick: () => window.location.href = `/dashboard/alerts/${alert.id}`,
        },
      });
  }
};

/**
 * Create a notification for alert resolution
 */
export const createAlertResolvedNotification = async (alert: AlertRule) => {
  const notification = {
    type: NotificationType.ALERT_RESOLVED,
    priority: NotificationPriority.NORMAL,
    title: `Alert Resolved: ${alert.name}`,
    message: `The alert condition is no longer met.`,
    alertId: alert.id,
    portfolioId: alert.portfolioId,
    actionUrl: `/dashboard/alerts/${alert.id}`,
    actionLabel: 'View Alert',
    data: {
      alertType: alert.conditionType,
    },
  };

  store.dispatch(createNotification(notification));
  
  toast.success(`Alert resolved: ${alert.name}`, {
    duration: 4000,
  });
};

/**
 * Create a system notification
 */
export const createSystemNotification = async (
  title: string,
  message: string,
  type: NotificationType = NotificationType.SYSTEM,
  priority: NotificationPriority = NotificationPriority.NORMAL,
  actionUrl?: string,
  actionLabel?: string
) => {
  const notification = {
    type,
    priority,
    title,
    message,
    actionUrl,
    actionLabel,
  };

  store.dispatch(createNotification(notification));
};

/**
 * Get notification type based on alert condition type
 */
const getNotificationTypeFromAlert = (alert: AlertRule): NotificationType => {
  switch (alert.conditionType) {
    case 'drift':
    case 'sector_drift':
    case 'asset_class_drift':
      return NotificationType.PORTFOLIO_DRIFT;
    case 'price_movement':
      return NotificationType.PRICE_MOVEMENT;
    default:
      return NotificationType.ALERT_TRIGGERED;
  }
};

/**
 * Get notification priority based on alert configuration
 */
const getNotificationPriorityFromAlert = (alert: AlertRule): NotificationPriority => {
  // Check if alert has high threshold values that indicate urgency
  const config = alert.conditionConfig;
  
  if (alert.conditionType === 'price_movement') {
    const threshold = parseFloat(config.threshold_pct || '0');
    if (threshold >= 10) return NotificationPriority.URGENT;
    if (threshold >= 5) return NotificationPriority.HIGH;
  }
  
  if (alert.conditionType.includes('drift')) {
    const threshold = parseFloat(config.thresholdPercent || '0');
    if (threshold >= 20) return NotificationPriority.URGENT;
    if (threshold >= 10) return NotificationPriority.HIGH;
  }
  
  // Default to normal priority
  return NotificationPriority.NORMAL;
};

/**
 * Generate alert message based on alert type and configuration
 */
const getAlertMessage = (alert: AlertRule, history?: AlertHistory): string => {
  const config = alert.conditionConfig;
  
  switch (alert.conditionType) {
    case 'price_movement':
      return `Price movement of ${config.threshold_pct || 'N/A'}% detected for ${config.symbol || 'selected asset'}.`;
    
    case 'drift':
      return `Portfolio drift of ${config.thresholdPercent || 'N/A'}% detected from target allocation.`;
    
    case 'sector_drift':
      const sectorName = config.sectorName || config.sectorId || 'selected sector';
      return `Sector drift of ${config.thresholdPercent || 'N/A'}% detected in ${sectorName}.`;
    
    case 'asset_class_drift':
      const assetClassName = config.assetClassName || config.assetClassId || 'selected asset class';
      return `Asset class drift of ${config.thresholdPercent || 'N/A'}% detected in ${assetClassName}.`;
    
    case 'cash_idle':
      return `Idle cash of $${config.threshold_amount || 'N/A'} detected in your portfolio.`;
    
    case 'dividend':
      return `Dividend payment received for ${config.symbol || 'selected asset'}.`;
    
    default:
      return 'Alert condition has been met.';
  }
};

/**
 * Generate short alert message for toast notifications
 */
const getShortAlertMessage = (alert: AlertRule): string => {
  const config = alert.conditionConfig;
  
  switch (alert.conditionType) {
    case 'price_movement':
      return `${config.threshold_pct || 'N/A'}% price movement`;
    
    case 'drift':
      return `${config.thresholdPercent || 'N/A'}% portfolio drift`;
    
    case 'sector_drift':
      return `${config.thresholdPercent || 'N/A'}% sector drift`;
    
    case 'asset_class_drift':
      return `${config.thresholdPercent || 'N/A'}% asset class drift`;
    
    case 'cash_idle':
      return `$${config.threshold_amount || 'N/A'} idle cash`;
    
    case 'dividend':
      return 'Dividend received';
    
    default:
      return 'Alert triggered';
  }
};
