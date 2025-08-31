import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { NotificationCard } from '../components/ui/NotificationCard';
import { useNotificationStore } from '../store/notificationStore';
import './NotificationsPage.scss';

/**
 * Notifications page component
 */
export const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    summary,
    isLoading,
    error,
    fetchNotifications,
    fetchSummary,
    markAsRead,
    markAllAsRead,
    clearError
  } = useNotificationStore();

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchSummary();
  }, [fetchNotifications, fetchSummary]);

  const handleBack = () => {
    navigate('/');
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    if (summary.unread === 0) return;
    
    setIsMarkingAllRead(true);
    await markAllAsRead();
    setIsMarkingAllRead(false);
  };

  const handleRefresh = () => {
    clearError();
    fetchNotifications();
    fetchSummary();
  };

  const headerActions = (
    <div className="notifications-page__actions">
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        icon={<FiArrowLeft />}
      >
        Back to Users
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isLoading}
        icon={<FiRefreshCw />}
      >
        Refresh
      </Button>
      
      {summary.unread > 0 && (
        <Button
          variant="primary"
          size="sm"
          onClick={handleMarkAllAsRead}
          disabled={isMarkingAllRead}
          icon={<FiCheck />}
        >
          {isMarkingAllRead ? 'Marking...' : `Mark all read (${summary.unread})`}
        </Button>
      )}
    </div>
  );

  if (isLoading && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <Header
          title="Notifications"
          subtitle="Stay updated with the latest information"
        />
        <div className="notifications-page__loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <Header
        title="Notifications"
        subtitle={`${summary.total} total${summary.unread > 0 ? `, ${summary.unread} unread` : ''}`}
        actions={headerActions}
      />

      <div className="notifications-page__content">
        {error && (
          <div className="notifications-page__error">
            <p>Failed to load notifications: {error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="notifications-page__empty">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-page__list">
            {notifications
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
