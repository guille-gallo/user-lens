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

  return (
    <div 
      className={`notification-card ${notification.isRead ? 'notification-card--read' : 'notification-card--unread'} notification-card--${notification.type}`}
      onClick={handleMarkAsRead}
    >
      <div className="notification-card__icon">
        <IconComponent />
      </div>
      
      <div className="notification-card__content">
        <div className="notification-card__header">
          <h3 className="notification-card__title">{notification.title}</h3>
          <span className="notification-card__timestamp">
            {formatTimestamp(notification.timestamp)}
          </span>
        </div>
        
        <p className="notification-card__message">{notification.message}</p>
        
        {!notification.isRead && (
          <div className="notification-card__unread-indicator" />
        )}
      </div>
    </div>
  );
};
