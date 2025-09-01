import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeaderActions } from '../components/layout';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NotificationCard } from '../components/ui/NotificationCard';
import { useNotificationStore } from "../store";
import { useDocumentTitle } from '../hooks';
import './NotificationsPage.scss';

/**
 * Notifications page component
 */
export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { setHeaderActions, clearHeaderActions } = useHeaderActions();
  
  // Set document title
  useDocumentTitle('Notifications');
  
  const {
    notifications,
    summary,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearError
  } = useNotificationStore();

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    // Fetch notifications (which will also update summary automatically)
    fetchNotifications();
  }, [fetchNotifications]);

  const handleBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleMarkAsRead = useCallback(async (notificationId: number) => {
    await markAsRead(notificationId);
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (summary.unread === 0) return;
    
    setIsMarkingAllRead(true);
    await markAllAsRead();
    setIsMarkingAllRead(false);
  }, [summary.unread, markAllAsRead]);

  const handleRefresh = useCallback(() => {
    clearError();
    fetchNotifications(true); // Force refresh (summary updates automatically)
  }, [clearError, fetchNotifications]);

  // Set header actions
  useEffect(() => {
    const headerActions = (
      <div className="notifications-page__actions">
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
        
        <Button
          variant="outline"
          onClick={handleBack}
        >
          ← Back to Users
        </Button>
        
        {summary.unread > 0 && (
          <Button
            variant="primary"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? 'Marking...' : `Mark all read (${summary.unread})`}
          </Button>
        )}
      </div>
    );

    setHeaderActions(headerActions);
    
    return () => {
      clearHeaderActions();
    };
  }, [handleBack, handleRefresh, handleMarkAllAsRead, isLoading, isMarkingAllRead, summary.unread, setHeaderActions, clearHeaderActions]);

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
            <Button onClick={handleRefresh} variant="outline" size="small">
              Try Again
            </Button>
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
