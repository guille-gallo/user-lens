import type { Notification } from '../../types';

/**
 * State update utilities for notifications
 * Following Single Responsibility Principle
 */
export class NotificationStateUtils {
  static markNotificationAsRead(notifications: Notification[], notificationId: number): Notification[] {
    return notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );
  }

  static markAllNotificationsAsRead(notifications: Notification[]): Notification[] {
    return notifications.map(notification => ({
      ...notification,
      isRead: true
    }));
  }
}
