import { create } from 'zustand';
import { NotificationService } from '../services';
import type { Notification, NotificationSummary } from '../types';
import { NotificationErrorHandler, NotificationStateUtils } from './utils';

interface NotificationState {
  notifications: Notification[];
  summary: NotificationSummary;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

const initialSummary: NotificationSummary = {
  total: 0,
  unread: 0,
  hasUnread: false
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  summary: initialSummary,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const notifications = await NotificationService.fetchNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      const errorMessage = NotificationErrorHandler.handleError(error, 'Failed to fetch notifications');
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await NotificationService.getNotificationSummary();
      set({ summary });
    } catch (error) {
      NotificationErrorHandler.logError('fetch notification summary', error);
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      
      if (success) {
        const { notifications, fetchSummary } = get();
        const updatedNotifications = NotificationStateUtils.markNotificationAsRead(notifications, notificationId);
        
        set({ notifications: updatedNotifications });
        
        // Refresh summary asynchronously without blocking UI
        fetchSummary();
      }
    } catch (error) {
      NotificationErrorHandler.logError('mark notification as read', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      
      if (success) {
        const { notifications, fetchSummary } = get();
        const updatedNotifications = NotificationStateUtils.markAllNotificationsAsRead(notifications);
        
        set({ notifications: updatedNotifications });
        
        // Refresh summary asynchronously without blocking UI
        fetchSummary();
      }
    } catch (error) {
      NotificationErrorHandler.logError('mark all notifications as read', error);
    }
  },

  clearError: () => set({ error: null })
}));
