/**
 * Notification Bell Button Component
 * Triggers the notification panel and shows unread count
 */

"use client";

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  selectNotificationStats,
  togglePanel,
} from '@/store/notificationsSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}

/**
 * Notification bell button that shows unread count and opens notification panel
 */
export default function NotificationBell({ 
  className, 
  variant = "ghost", 
  size = "sm" 
}: NotificationBellProps) {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectNotificationStats);

  const handleClick = () => {
    dispatch(togglePanel());
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("relative p-2", className)}
      onClick={handleClick}
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
  );
}
