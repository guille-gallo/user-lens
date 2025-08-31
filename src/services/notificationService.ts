export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  hasUnread: boolean;
}

const BASE_URL = 'http://localhost:3001';

/**
 * Service for managing notifications
 */
export class NotificationService {
  /**
   * Fetch all notifications
   */
  static async fetchNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${BASE_URL}/notifications`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get notification summary (total, unread count, etc.)
   */
  static async getNotificationSummary(): Promise<NotificationSummary> {
    try {
      const notifications = await this.fetchNotifications();
      const unread = notifications.filter(n => !n.isRead).length;
      
      return {
        total: notifications.length,
        unread,
        hasUnread: unread > 0
      };
    } catch (error) {
      console.error('Error getting notification summary:', error);
      return {
        total: 0,
        unread: 0,
        hasUnread: false
      };
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notificationId: number): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      const notifications = await this.fetchNotifications();
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      const promises = unreadNotifications.map(notification =>
        this.markAsRead(notification.id)
      );
      
      const results = await Promise.all(promises);
      return results.every(result => result);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}
