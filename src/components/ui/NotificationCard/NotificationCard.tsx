import { FiInfo, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import type { Notification } from '../../../services/notificationService';
import './NotificationCard.scss';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

const getIconByType = (type: Notification['type']) => {
  switch (type) {
    case 'info':
      return FiInfo;
    case 'warning':
      return FiAlertTriangle;
    case 'error':
      return FiAlertCircle;
    case 'success':
      return FiCheckCircle;
    default:
      return FiInfo;
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Individual notification card component
 */
export const NotificationCard = ({ notification, onMarkAsRead }: NotificationCardProps) => {
  const IconComponent = getIconByType(notification.type);

  const handleMarkAsRead = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMarkAsRead();
    }
  };

  const cardId = `notification-${notification.id}`;
  const titleId = `${cardId}-title`;
  const messageId = `${cardId}-message`;
  const timestampId = `${cardId}-timestamp`;

  return (
    <article 
      className={`notification-card ${notification.isRead ? 'notification-card--read' : 'notification-card--unread'} notification-card--${notification.type}`}
      onClick={handleMarkAsRead}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-labelledby={titleId}
      aria-describedby={`${messageId} ${timestampId}`}
      aria-pressed={notification.isRead}
      aria-label={`${notification.isRead ? 'Read' : 'Unread'} ${notification.type} notification: ${notification.title}. Press Enter or Space to mark as ${notification.isRead ? 'unread' : 'read'}.`}
    >
      <div className="notification-card__icon" aria-hidden="true">
        <IconComponent />
      </div>
      
      <div className="notification-card__content">
        <div className="notification-card__header">
          <h3 className="notification-card__title" id={titleId}>{notification.title}</h3>
          <time 
            className="notification-card__timestamp"
            id={timestampId}
            dateTime={notification.timestamp}
          >
            {formatTimestamp(notification.timestamp)}
          </time>
        </div>
        
        <p className="notification-card__message" id={messageId}>{notification.message}</p>
        
        {!notification.isRead && (
          <div 
            className="notification-card__unread-indicator" 
            aria-label="Unread notification indicator"
          />
        )}
      </div>
    </article>
  );
};
