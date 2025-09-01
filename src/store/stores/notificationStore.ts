import { create } from 'zustand';
import { NotificationService } from '../../services';
import type { Notification, NotificationSummary } from '../../types';
import { NotificationErrorHandler, NotificationStateUtils } from '../utils';

interface NotificationState {
  notifications: Notification[];
  summary: NotificationSummary;
  isLoading: boolean;
  error: string | null;
  lastFetch: number; // Timestamp of last fetch
  lastSummaryFetch: number; // Timestamp of last summary fetch
  
  // Actions
  fetchNotifications: (force?: boolean) => Promise<void>;
  fetchSummary: (force?: boolean) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

const initialSummary: NotificationSummary = {
  total: 0,
  unread: 0,
  hasUnread: false
};

// Cache duration in milliseconds (5 minutes for notifications, 30 seconds for summary)
const NOTIFICATION_CACHE_DURATION = 5 * 60 * 1000;
const SUMMARY_CACHE_DURATION = 30 * 1000;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  summary: initialSummary,
  isLoading: false,
  error: null,
  lastFetch: 0,
  lastSummaryFetch: 0,

  fetchNotifications: async (force = false) => {
    const now = Date.now();
    const { lastFetch, isLoading } = get();
    
    // Skip if recently fetched or currently loading (unless forced)
    if (!force && (isLoading || (now - lastFetch < NOTIFICATION_CACHE_DURATION))) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const notifications = await NotificationService.fetchNotifications();
      
      // Calculate summary locally to avoid duplicate API calls
      const unread = notifications.filter((n: Notification) => !n.isRead).length;
      const summary = {
        total: notifications.length,
        unread,
        hasUnread: unread > 0
      };
      
      set({ 
        notifications, 
        summary,
        isLoading: false, 
        lastFetch: now,
        lastSummaryFetch: now 
      });
    } catch (error) {
      const errorMessage = NotificationErrorHandler.handleError(error, 'Failed to fetch notifications');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSummary: async (force = false) => {
    const now = Date.now();
    const { lastSummaryFetch, notifications, lastFetch } = get();
    
    // Skip if recently fetched (unless forced)
    if (!force && (now - lastSummaryFetch < SUMMARY_CACHE_DURATION)) {
      return;
    }

    // If we have notifications, ALWAYS calculate locally - never call API
    if (notifications.length > 0) {
      const unread = notifications.filter((n: Notification) => !n.isRead).length;
      const summary = {
        total: notifications.length,
        unread,
        hasUnread: unread > 0
      };
      set({ summary, lastSummaryFetch: now });
      return;
    }

    // Only if we have NO notifications at all, fetch them (which will calculate summary)
    if (now - lastFetch > NOTIFICATION_CACHE_DURATION) {
      await get().fetchNotifications(force);
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      
      if (success) {
        const { notifications } = get();
        const updatedNotifications = NotificationStateUtils.markNotificationAsRead(notifications, notificationId);
        
        // Calculate new summary locally without API call
        const unread = updatedNotifications.filter((n: Notification) => !n.isRead).length;
        const summary = {
          total: updatedNotifications.length,
          unread,
          hasUnread: unread > 0
        };
        
        set({ 
          notifications: updatedNotifications, 
          summary,
          lastSummaryFetch: Date.now()
        });
      }
    } catch (error) {
      NotificationErrorHandler.logError('mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      
      if (success) {
        const { notifications } = get();
        const updatedNotifications = NotificationStateUtils.markAllNotificationsAsRead(notifications);
        
        // Calculate new summary locally without API call
        const summary = {
          total: updatedNotifications.length,
          unread: 0,
          hasUnread: false
        };
        
        set({ 
          notifications: updatedNotifications, 
          summary,
          lastSummaryFetch: Date.now()
        });
      }
    } catch (error) {
      NotificationErrorHandler.logError('mark all notifications as read', error);
    }
  },

  clearError: () => set({ error: null })
}));
