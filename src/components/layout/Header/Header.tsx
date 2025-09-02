import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { NotificationBell } from '../../ui/NotificationBell';
import { useNotificationStore } from '../../../store';
import { ARIA_LABELS } from '../../../constants/accessibility';
import './Header.scss';

/**
 * Header Component - Self-contained header that manages its own actions based on route
 */
export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  // Notification store for conditional actions
  const { 
    summary, 
    isLoading, 
    markAllAsRead, 
    fetchNotifications, 
    clearError 
  } = useNotificationStore();

  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);

  // Determine current page context
  const isUserDetailPage = location.pathname.startsWith('/users/') && params.id;
  const isNotificationsPage = location.pathname === '/notifications';

  // Navigation handlers
  const handleBackToUsers = React.useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleRefreshNotifications = React.useCallback(() => {
    clearError();
    fetchNotifications(true); // Force refresh
  }, [clearError, fetchNotifications]);

  const handleMarkAllAsRead = React.useCallback(async () => {
    if (summary.unread === 0) return;
    
    setIsMarkingAllRead(true);
    await markAllAsRead();
    setIsMarkingAllRead(false);
  }, [summary.unread, markAllAsRead]);

  // Render page-specific actions
  const renderPageActions = () => {
    if (isUserDetailPage) {
      return (
        <Button
          variant="outline"
          onClick={handleBackToUsers}
          className="header__action"
        >
          ← Back to Users
        </Button>
      );
    }

    if (isNotificationsPage) {
      return (
        <div className="header__actions-group">
          <Button
            variant="outline"
            onClick={handleRefreshNotifications}
            disabled={isLoading}
            className="header__action"
          >
            Refresh
          </Button>
          
          <Button
            variant="outline"
            onClick={handleBackToUsers}
            className="header__action"
          >
            ← Back to Users
          </Button>
          
          {summary.unread > 0 && (
            <Button
              variant="primary"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
              className="header__action"
            >
              {isMarkingAllRead ? 'Marking...' : `Mark all read (${summary.unread})`}
            </Button>
          )}
        </div>
      );
    }

    // Users page and other pages - no specific actions needed
    return null;
  };

  return (
    <header className="header" role="banner">
      <div className="header__content">
        <h1 className="header__title">
          <Link 
            to="/" 
            className="header__title-link"
            aria-label={ARIA_LABELS.HOME_NAVIGATION}
          >
            User Lens
          </Link>
        </h1>
        
        <nav 
          className="header__navigation" 
          role="navigation" 
          aria-label={ARIA_LABELS.PRIMARY_NAVIGATION}
        >
          <div className="header__actions">
            {renderPageActions()}
          </div>
          
          <div className="header__notifications">
            <NotificationBell />
          </div>
        </nav>
      </div>
    </header>
  );
};
