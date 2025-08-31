import { create } from 'zustand';
import { NotificationService, type Notification, type NotificationSummary } from '../services/notificationService';

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
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false 
      });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await NotificationService.getNotificationSummary();
      set({ summary });
    } catch (error) {
      console.error('Failed to fetch notification summary:', error);
    }
  },

  markAsRead: async (notificationId: number) => {
    try {
      const success = await NotificationService.markAsRead(notificationId);
      
      if (success) {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        );
        
        set({ notifications: updatedNotifications });
        
        // Refresh summary
        get().fetchSummary();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      
      if (success) {
        const { notifications } = get();
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
        
        set({ notifications: updatedNotifications });
        
        // Refresh summary
        get().fetchSummary();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  clearError: () => set({ error: null })
}));
