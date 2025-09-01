import { API_CONFIG, ENDPOINTS } from '../../constants/api';
import { BaseHttpService } from '../http/httpService';
import type { Notification, NotificationSummary } from '../../types';

/**
 * Notification Service
 */
class NotificationServiceImpl extends BaseHttpService {
  constructor() {
    super(API_CONFIG.LOCAL_API);
  }

  /**
   * Fetch all notifications
   */
  async fetchNotifications(): Promise<Notification[]> {
    try {
      return await this.get<Notification[]>(ENDPOINTS.NOTIFICATIONS);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return []; // Graceful degradation
    }
  }

  /**
   * Get notification summary (pure function - no side effects)
   */
  getSummary(notifications: Notification[]): NotificationSummary {
    const unread = notifications.filter((n: Notification) => !n.isRead).length;
    
    return {
      total: notifications.length,
      unread,
      hasUnread: unread > 0
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<boolean> {
    try {
      await this.put(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}`, { isRead: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read (optimized batch operation)
   */
  async markAllAsRead(): Promise<boolean> {
    try {
      const notifications = await this.fetchNotifications();
      const unreadNotifications = notifications.filter((n: Notification) => !n.isRead);
      
      // Performance optimization: parallel requests
      const promises = unreadNotifications.map((notification: Notification) =>
        this.markAsRead(notification.id)
      );
      
      const results = await Promise.all(promises);
      return results.every((result: boolean) => result);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }
}

// Export singleton instance for performance
const notificationService = new NotificationServiceImpl();

/**
 * Legacy static wrapper for backward compatibility
 * Follows Adapter pattern
 */
export class NotificationService {
  static async fetchNotifications(): Promise<Notification[]> {
    return notificationService.fetchNotifications();
  }

  static async getNotificationSummary(): Promise<NotificationSummary> {
    const notifications = await notificationService.fetchNotifications();
    return notificationService.getSummary(notifications);
  }

  static async markAsRead(notificationId: number): Promise<boolean> {
    return notificationService.markAsRead(notificationId);
  }

  static async markAllAsRead(): Promise<boolean> {
    return notificationService.markAllAsRead();
  }
}
