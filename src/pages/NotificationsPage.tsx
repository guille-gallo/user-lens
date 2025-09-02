import { useEffect } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NotificationCard } from '../components/ui/NotificationCard';
import { useNotificationStore } from "../store";
import { useDocumentTitle } from '../hooks';
import './NotificationsPage.scss';

/**
 * Notifications page component
 */
export const NotificationsPage = () => {
  // Set document title
  useDocumentTitle('Notifications');
  
  const {
    notifications,
    summary,
    isLoading,
    error,
    fetchNotifications,
    markAsRead
  } = useNotificationStore();

  useEffect(() => {
    // Fetch notifications (which will also update summary automatically)
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-page__loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__header">
        <h1 className="notifications-page__title">Notifications</h1>
        <p className="notifications-page__subtitle">
          {`${summary.total} total${summary.unread > 0 ? `, ${summary.unread} unread` : ''}`}
        </p>
      </div>

      <div className="notifications-page__content">
        {error && (
          <div className="notifications-page__error">
            <p>Failed to load notifications: {error}</p>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="notifications-page__empty" role="status" aria-live="polite">
            <p>No notifications yet</p>
          </div>
        ) : (
          <section 
            className="notifications-page__list"
            aria-label="Notifications list"
            role="region"
          >
            <h2 className="sr-only">Notification items</h2>
            {notifications
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
          </section>
        )}
      </div>
    </div>
  );
};
