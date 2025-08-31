import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useNotificationStore } from '../../../store/notificationStore';
import './NotificationBell.scss';

interface NotificationBellProps {
  className?: string;
}

/**
 * Notification bell icon with badge indicator
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = ""
}) => {
  const navigate = useNavigate();
  const { summary, fetchSummary } = useNotificationStore();

  useEffect(() => {
    // Fetch summary on mount
    fetchSummary();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchSummary, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSummary]);

  const handleClick = () => {
    navigate('/notifications');
  };

  return (
    <button 
      className={`notification-bell ${className}`}
      onClick={handleClick}
      aria-label={`Notifications${summary.hasUnread ? ` (${summary.unread} unread)` : ''}`}
      title={`${summary.total} notifications${summary.hasUnread ? `, ${summary.unread} unread` : ''}`}
    >
      <div className="notification-bell__icon-container">
        <FiBell className="notification-bell__icon" />
        {summary.hasUnread && (
          <span className="notification-bell__badge">
            {summary.unread > 9 ? '9+' : summary.unread}
          </span>
        )}
      </div>
    </button>
  );
};
