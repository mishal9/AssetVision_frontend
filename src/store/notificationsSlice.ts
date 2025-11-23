/**
 * Redux slice for managing notifications
 */

import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Notification, NotificationFilters, NotificationStats, NotificationType, NotificationPriority } from '../types/notifications';
import type { RootState } from './index';

interface NotificationsState {
  notifications: Notification[];
  stats: NotificationStats;
  filters: NotificationFilters;
  isLoading: boolean;
  error: string | null;
  panelOpen: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  stats: {
    total: 0,
    unread: 0,
    byType: {} as Record<NotificationType, number>,
    byPriority: {} as Record<NotificationPriority, number>,
  },
  filters: {},
  isLoading: false,
  error: null,
  panelOpen: false,
};

/**
 * Create a new notification (typically triggered by alert system)
 */
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const notification: Notification = {
      ...notificationData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    // In a real app, this would save to backend
    // For now, just return the notification
    return notification;
  }
);

/**
 * Mark notification as read
 */
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    // In a real app, this would update the backend
    return notificationId;
  }
);

/**
 * Mark all notifications as read
 */
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    // In a real app, this would update the backend
    return true;
  }
);

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId: string) => {
    // In a real app, this would delete from backend
    return notificationId;
  }
);

/**
 * Clear all notifications
 */
export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async () => {
    // In a real app, this would clear from backend
    return true;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<NotificationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    togglePanel: (state) => {
      state.panelOpen = !state.panelOpen;
    },
    openPanel: (state) => {
      state.panelOpen = true;
    },
    closePanel: (state) => {
      state.panelOpen = false;
    },
    updateStats: (state) => {
      const stats: NotificationStats = {
        total: state.notifications.length,
        unread: state.notifications.filter(n => !n.isRead).length,
        byType: {} as Record<NotificationType, number>,
        byPriority: {} as Record<NotificationPriority, number>,
      };

      // Count by type
      state.notifications.forEach(notification => {
        stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1;
      });

      state.stats = stats;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create notification
      .addCase(createNotification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications.unshift(action.payload);
        notificationsSlice.caseReducers.updateStats(state);
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create notification';
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.isRead = true;
        }
        notificationsSlice.caseReducers.updateStats(state);
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        notificationsSlice.caseReducers.updateStats(state);
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        notificationsSlice.caseReducers.updateStats(state);
      })
      
      // Clear all notifications
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        notificationsSlice.caseReducers.updateStats(state);
      });
  },
});

export const {
  setFilters,
  clearFilters,
  togglePanel,
  openPanel,
  closePanel,
  updateStats,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;

// Base selectors
export const selectAllNotifications = (state: RootState) => 
  state.notifications.notifications;

export const selectNotificationStats = (state: RootState) => 
  state.notifications.stats;

export const selectNotificationFilters = (state: RootState) => 
  state.notifications.filters;

export const selectIsPanelOpen = (state: RootState) => 
  state.notifications.panelOpen;

// Memoized selectors using createSelector to prevent unnecessary re-renders
export const selectUnreadNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => notifications.filter(n => !n.isRead)
);

export const selectFilteredNotifications = createSelector(
  [selectAllNotifications, selectNotificationFilters],
  (notifications, filters) => {
    return notifications.filter(notification => {
      if (filters.type && notification.type !== filters.type) return false;
      if (filters.priority && notification.priority !== filters.priority) return false;
      if (filters.isRead !== undefined && notification.isRead !== filters.isRead) return false;
      if (filters.dateFrom && notification.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && notification.timestamp > filters.dateTo) return false;
      
      return true;
    });
  }
);
