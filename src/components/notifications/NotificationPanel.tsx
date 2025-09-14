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
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/store/notificationsSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    case NotificationPriority.HIGH:
      return 'border-l-amber-500 bg-amber-50 dark:bg-amber-950/20';
    case NotificationPriority.NORMAL:
      return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
    case NotificationPriority.LOW:
    default:
      return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
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

  return (
    <DropdownMenu open={isOpen} onOpenChange={(open) => !open && dispatch(closePanel())}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("relative p-2", className)}
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
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 p-0" 
        align="end" 
        sideOffset={5}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <DropdownMenuLabel className="p-0 text-base font-semibold">
              Notifications
            </DropdownMenuLabel>
            {stats.unread > 0 && (
              <p className="text-sm text-muted-foreground">
                {stats.unread} unread
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2">
              {stats.unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 px-2 text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/75 mt-1">
              We'll notify you when something important happens
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "relative p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-accent/50",
                      getPriorityColor(notification.priority),
                      !notification.isRead && "bg-opacity-100"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
                    )}

                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={cn(
                            "text-sm font-medium truncate",
                            !notification.isRead && "font-semibold"
                          )}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatRelativeTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.actionUrl && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                            <ExternalLink className="h-3 w-3" />
                            {notification.actionLabel || 'View details'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:text-destructive"
                        onClick={(e) => handleDelete(notification.id, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => {
                  router.push('/dashboard/notifications');
                  dispatch(closePanel());
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
