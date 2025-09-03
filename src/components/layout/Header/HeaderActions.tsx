import React from 'react';
import { Button } from '../../ui/Button';
import { useHeaderActions } from '../../../hooks/useHeaderActions';

/**
 * HeaderActions Component
 * 
 * Contains the business logic for header actions based on current route.
 * This component encapsulates the page-specific logic that was previously
 * embedded in the Header component.
 */
export const HeaderActions: React.FC = () => {
  const {
    isUserDetailPage,
    isNotificationsPage,
    summary,
    navigateToUsers,
    handleMarkAllAsRead
  } = useHeaderActions();

  const [isMarkingAllRead, setIsMarkingAllRead] = React.useState(false);

  const handleMarkAllAsReadWithLoading = React.useCallback(async () => {
    setIsMarkingAllRead(true);
    await handleMarkAllAsRead();
    setIsMarkingAllRead(false);
  }, [handleMarkAllAsRead]);

  if (isUserDetailPage) {
    return (
      <Button
        variant="outline"
        onClick={navigateToUsers}
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
          onClick={navigateToUsers}
          className="header__action"
        >
          ← Back to Users
        </Button>
        
        {summary.unread > 0 && (
          <Button
            variant="primary"
            onClick={handleMarkAllAsReadWithLoading}
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
