/**
 * Notification system types for alerts and other app notifications
 */

export enum NotificationType {
  ALERT_TRIGGERED = 'alert_triggered',
  ALERT_RESOLVED = 'alert_resolved',
  PORTFOLIO_DRIFT = 'portfolio_drift',
  PRICE_MOVEMENT = 'price_movement',
  SYSTEM = 'system',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFO = 'info'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  alertId?: string;
  portfolioId?: string;
  data?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  alertNotifications: boolean;
  portfolioNotifications: boolean;
  systemNotifications: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
