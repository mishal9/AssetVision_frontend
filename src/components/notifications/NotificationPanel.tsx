/**
 * Notification Panel Component
 * Displays a dropdown panel with user notifications
 */

"use client";

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectFilteredNotifications,
  selectNotificationStats,
  selectIsPanelOpen,
  closePanel,
  openPanel,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/store/notificationsSlice';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// Removed DropdownMenu imports - using simple conditional render instead
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertTriangle,
  Info,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationType, NotificationPriority } from '@/types/notifications';
import { useRouter } from 'next/navigation';

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.ALERT_TRIGGERED:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case NotificationType.ALERT_RESOLVED:
      return <Check className="h-4 w-4 text-green-500" />;
    case NotificationType.PORTFOLIO_DRIFT:
      return <TrendingDown className="h-4 w-4 text-orange-500" />;
    case NotificationType.PRICE_MOVEMENT:
      return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case NotificationType.SUCCESS:
      return <Check className="h-4 w-4 text-green-500" />;
    case NotificationType.WARNING:
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case NotificationType.ERROR:
      return <X className="h-4 w-4 text-red-500" />;
    case NotificationType.SYSTEM:
    case NotificationType.INFO:
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

/**
 * Get priority color classes
 */
const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20';
    case NotificationPriority.HIGH:
      return 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10 hover:bg-orange-50 dark:hover:bg-orange-950/20';
    case NotificationPriority.NORMAL:
      return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10 hover:bg-blue-50 dark:hover:bg-blue-950/20';
    case NotificationPriority.LOW:
    default:
      return 'border-l-gray-400 bg-gray-50/50 dark:bg-gray-950/10 hover:bg-gray-50 dark:hover:bg-gray-950/20';
  }
};

/**
 * Format relative time
 */
const formatRelativeTime = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
};

interface NotificationPanelProps {
  className?: string;
}

export default function NotificationPanel({ className }: NotificationPanelProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const notifications = useAppSelector(selectFilteredNotifications);
  const stats = useAppSelector(selectNotificationStats);
  const isOpen = useAppSelector(selectIsPanelOpen);
  const { refreshNotifications } = useAlertNotifications();


  // Removed auto-demo notification creation - notifications now come from real alerts only

  // Click outside handler to close panel
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && event.target instanceof Element) {
        const panel = document.querySelector('[data-notification-panel]');
        const button = document.querySelector('[data-notification-button]');
        
        if (panel && !panel.contains(event.target) && button && !button.contains(event.target)) {
          dispatch(closePanel());
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, dispatch]);

  const handleMarkAsRead = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(markAsRead(notificationId));
  };

  const handleDelete = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(deleteNotification(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markAsRead(notification.id));
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    // Close panel
    dispatch(closePanel());
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) {
      dispatch(closePanel());
    } else {
      dispatch(openPanel());
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={cn("relative p-2", className)}
        onClick={handleTriggerClick}
        data-notification-button
      >
        {stats.unread > 0 ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {stats.unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>
      
      {/* Simple conditional render instead of DropdownMenu */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 p-0 backdrop-blur-sm"
          data-notification-panel
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
              {stats.unread > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {stats.unread} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshNotifications}
                className="h-8 w-8 p-0"
                title="Refresh notifications"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {notifications.length > 0 && (
                <>
                  {stats.unread > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="h-8 w-8 p-0"
                      title="Mark all notifications as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    title="Clear all notifications"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="p-2">
                {notifications.map((notification, index) => (
                  <div key={notification.id} className="group">
                    <div
                      className={cn(
                        "relative p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm",
                        getPriorityColor(notification.priority),
                        !notification.isRead && "bg-opacity-100 shadow-sm"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
                      )}

                      <div className="flex items-start gap-3 pr-8">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={cn(
                              "text-sm font-medium leading-5",
                              !notification.isRead && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatRelativeTime(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-5 mb-2">
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                              <ExternalLink className="h-3 w-3" />
                              {notification.actionLabel || 'View details'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                          onClick={(e) => handleDelete(notification.id, e)}
                          title="Delete notification"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    {index < notifications.length - 1 && (
                      <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
