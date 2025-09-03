import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useNotificationStore } from '../store';

/**
 * Hook for header action logic
 * 
 * Provides common header action handlers and state that can be used
 * by components to build their own header actions. This follows the
 * React pattern of providing reusable logic through hooks.
 */
export const useHeaderActions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { summary, markAllAsRead } = useNotificationStore();

  // Derived state
  const isUserDetailPage = location.pathname.startsWith('/users/') && params.id;
  const isNotificationsPage = location.pathname === '/notifications';
  
  // Action handlers
  const navigateToUsers = () => navigate('/');
  
  const handleMarkAllAsRead = async () => {
    if (summary.unread === 0) return;
    await markAllAsRead();
  };

  return {
    // State
    location,
    params,
    summary,
    isUserDetailPage,
    isNotificationsPage,
    
    // Actions
    navigateToUsers,
    handleMarkAllAsRead
  };
};
