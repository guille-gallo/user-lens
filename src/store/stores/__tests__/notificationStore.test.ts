import { act, renderHook } from '@testing-library/react';
import { useNotificationStore } from '../notificationStore';
import { NotificationService } from '../../../services';
import type { Notification, NotificationSummary } from '../../../types';

// Mock dependencies
jest.mock('../../../services', () => ({
  NotificationService: {
    fetchNotifications: jest.fn(),
    getNotificationSummary: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
  },
}));

jest.mock('../../utils', () => ({
  NotificationErrorHandler: {
    handleError: jest.fn(),
    logError: jest.fn(),
  },
  NotificationStateUtils: {
    markNotificationAsRead: jest.fn(),
    markAllNotificationsAsRead: jest.fn(),
  },
}));

const mockNotificationService = NotificationService as jest.Mocked<typeof NotificationService>;

describe('notificationStore', () => {
  const mockNotifications: Notification[] = [
    {
      id: 1,
      type: 'info',
      title: 'System Update',
      message: 'System maintenance completed',
      timestamp: '2024-01-15T10:00:00Z',
      isRead: false
    },
    {
      id: 2,
      type: 'success',
      title: 'New Message',
      message: 'You have a new message from John',
      timestamp: '2024-01-15T09:30:00Z',
      isRead: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Security Alert',
      message: 'Unusual login detected',
      timestamp: '2024-01-15T08:15:00Z',
      isRead: false
    }
  ];

  const mockSummary: NotificationSummary = {
    total: 3,
    unread: 2,
    hasUnread: true
  };

  const initialSummary: NotificationSummary = {
    total: 0,
    unread: 0,
    hasUnread: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useNotificationStore.setState({
      notifications: [],
      summary: initialSummary,
      isLoading: false,
      error: null,
      lastFetch: 0,
      lastSummaryFetch: 0,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      expect(result.current.notifications).toEqual([]);
      expect(result.current.summary).toEqual(initialSummary);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('fetchNotifications', () => {
    it('should fetch notifications successfully', async () => {
      mockNotificationService.fetchNotifications.mockResolvedValueOnce(mockNotifications);
      const { result } = renderHook(() => useNotificationStore());
      
      await act(async () => {
        await result.current.fetchNotifications();
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(result.current.error).toBe(null);
      expect(mockNotificationService.fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch notifications error', async () => {
      const errorMessage = 'Failed to fetch notifications';
      mockNotificationService.fetchNotifications.mockRejectedValueOnce(new Error('Network error'));
      
      const { NotificationErrorHandler } = require('../../utils');
      NotificationErrorHandler.handleError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useNotificationStore());
      
      await act(async () => {
        await result.current.fetchNotifications(true); // Force fetch to bypass cache
      });
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.notifications).toEqual([]);
      expect(NotificationErrorHandler.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to fetch notifications'
      );
    });

    it('should set loading state during fetch', async () => {
      mockNotificationService.fetchNotifications.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve(mockNotifications), 100);
        })
      );
      
      const { result } = renderHook(() => useNotificationStore());
      
      act(() => {
        result.current.fetchNotifications(true); // Force fetch to bypass cache
      });
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should clear error before fetching', async () => {
      mockNotificationService.fetchNotifications.mockResolvedValueOnce(mockNotifications);
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial error
      act(() => {
        useNotificationStore.setState({ error: 'Previous error' });
      });
      
      await act(async () => {
        await result.current.fetchNotifications(true); // Force fetch to bypass cache
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('fetchSummary', () => {
    it('should calculate summary locally when notifications exist', async () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial state with notifications (fresh cache)
      act(() => {
        useNotificationStore.setState({ 
          notifications: mockNotifications,
          lastFetch: Date.now()
        });
      });
      
      await act(async () => {
        await result.current.fetchSummary(true); // Force to bypass cache
      });
      
      // Should calculate locally, not call API
      expect(result.current.summary).toEqual(mockSummary);
      expect(mockNotificationService.getNotificationSummary).toHaveBeenCalledTimes(0);
    });

    it('should fetch notifications when no data exists', async () => {
      mockNotificationService.fetchNotifications.mockResolvedValueOnce(mockNotifications);
      const { result } = renderHook(() => useNotificationStore());
      
      // Ensure no notifications exist
      act(() => {
        useNotificationStore.setState({ 
          notifications: [],
          lastFetch: 0
        });
      });
      
      await act(async () => {
        await result.current.fetchSummary(true);
      });
      
      // Should trigger fetchNotifications which calculates summary
      expect(result.current.summary).toEqual(mockSummary);
      expect(mockNotificationService.fetchNotifications).toHaveBeenCalledTimes(1);
    });

    it('should not affect loading state when calculating locally', async () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial state with notifications
      act(() => {
        useNotificationStore.setState({ 
          notifications: mockNotifications,
          lastFetch: Date.now()
        });
      });
      
      act(() => {
        result.current.fetchSummary();
      });
      
      // Should not set loading state for local calculation
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = 1;
      const updatedNotifications = mockNotifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      
      mockNotificationService.markAsRead.mockResolvedValueOnce(true);
      mockNotificationService.getNotificationSummary.mockResolvedValueOnce({
        ...mockSummary,
        unread: mockSummary.unread - 1
      });

      const { NotificationStateUtils } = require('../../utils');
      NotificationStateUtils.markNotificationAsRead.mockReturnValueOnce(updatedNotifications);

      const { result } = renderHook(() => useNotificationStore());

      // Set initial notifications
      await act(async () => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });

      await act(async () => {
        await result.current.markAsRead(notificationId);
      });

      expect(result.current.notifications).toEqual(updatedNotifications);
      expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(notificationId);
      expect(NotificationStateUtils.markNotificationAsRead).toHaveBeenCalledWith(
        mockNotifications,
        notificationId
      );
      // Summary is now calculated locally, no API call expected
      expect(result.current.summary.unread).toBe(1); // One notification marked as read
    });

    it('should not update state when mark as read fails', async () => {
      const notificationId = 1;
      
      mockNotificationService.markAsRead.mockResolvedValueOnce(false);
      
      const { NotificationStateUtils } = require('../../utils');
      
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial notifications
      act(() => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });
      
      await act(async () => {
        await result.current.markAsRead(notificationId);
      });
      
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(NotificationStateUtils.markNotificationAsRead).not.toHaveBeenCalled();
      expect(mockNotificationService.getNotificationSummary).not.toHaveBeenCalled();
    });

    it('should handle mark as read error silently', async () => {
      const notificationId = 1;
      const error = new Error('Network error');
      
      mockNotificationService.markAsRead.mockRejectedValueOnce(error);
      
      const { NotificationErrorHandler } = require('../../utils');
      
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial notifications
      act(() => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });
      
      await act(async () => {
        await result.current.markAsRead(notificationId);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(NotificationErrorHandler.logError).toHaveBeenCalledWith(
        'mark notification as read',
        error
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      const updatedNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
      
      mockNotificationService.markAllAsRead.mockResolvedValueOnce(true);
      
      // Set up the mock before rendering the hook
      const { NotificationStateUtils } = require('../../utils');
      NotificationStateUtils.markAllNotificationsAsRead.mockReturnValueOnce(updatedNotifications);
      
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial notifications
      act(() => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });
      
      await act(async () => {
        await result.current.markAllAsRead();
      });
      
      expect(result.current.notifications).toEqual(updatedNotifications);
      expect(mockNotificationService.markAllAsRead).toHaveBeenCalledTimes(1);
      expect(NotificationStateUtils.markAllNotificationsAsRead).toHaveBeenCalledWith(
        mockNotifications
      );
      // Summary is now calculated locally, no API call expected
      expect(result.current.summary.unread).toBe(0); // All notifications marked as read
      expect(result.current.summary.hasUnread).toBe(false);
    });

    it('should not update state when mark all as read fails', async () => {
      mockNotificationService.markAllAsRead.mockResolvedValueOnce(false);
      
      const { NotificationStateUtils } = require('../../utils');
      
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial notifications
      act(() => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });
      
      await act(async () => {
        await result.current.markAllAsRead();
      });
      
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(NotificationStateUtils.markAllNotificationsAsRead).not.toHaveBeenCalled();
      expect(mockNotificationService.getNotificationSummary).not.toHaveBeenCalled();
    });

    it('should handle mark all as read error silently', async () => {
      const error = new Error('Network error');
      
      mockNotificationService.markAllAsRead.mockRejectedValueOnce(error);
      
      const { NotificationErrorHandler } = require('../../utils');
      
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial notifications
      act(() => {
        useNotificationStore.setState({ notifications: mockNotifications });
      });
      
      await act(async () => {
        await result.current.markAllAsRead();
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.notifications).toEqual(mockNotifications);
      expect(NotificationErrorHandler.logError).toHaveBeenCalledWith(
        'mark all notifications as read',
        error
      );
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial error
      act(() => {
        useNotificationStore.setState({ error: 'Some error' });
      });
      
      expect(result.current.error).toBe('Some error');
      
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full notification workflow', async () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // 1. Fetch notifications
      mockNotificationService.fetchNotifications.mockResolvedValueOnce(mockNotifications);
      
      await act(async () => {
        await result.current.fetchNotifications(true); // Force fetch
      });
      
      expect(result.current.notifications).toEqual(mockNotifications);
      
      // 2. Fetch summary
      mockNotificationService.getNotificationSummary.mockResolvedValueOnce(mockSummary);
      
      await act(async () => {
        await result.current.fetchSummary(true); // Force fetch
      });
      
      expect(result.current.summary).toEqual(mockSummary);
      
      // 3. Mark notification as read
      const updatedNotifications = mockNotifications.map(n => 
        n.id === 1 ? { ...n, isRead: true } : n
      );
      
      mockNotificationService.markAsRead.mockResolvedValueOnce(true);
      
      // Clear and reset the mock for this specific test
      const { NotificationStateUtils } = require('../../utils');
      NotificationStateUtils.markNotificationAsRead.mockReset();
      NotificationStateUtils.markNotificationAsRead.mockReturnValueOnce(updatedNotifications);
      
      await act(async () => {
        await result.current.markAsRead(1);
      });
      
      expect(result.current.notifications).toEqual(updatedNotifications);
      // Summary should be calculated locally now
      expect(result.current.summary.unread).toBe(1); // 2 unread - 1 marked = 1 unread
    });

    it('should handle error states properly across actions', async () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // 1. Fetch notifications error
      const { NotificationErrorHandler } = require('../../utils');
      NotificationErrorHandler.handleError.mockReturnValue('Fetch error');
      
      mockNotificationService.fetchNotifications.mockRejectedValueOnce(new Error('Network error'));
      
      await act(async () => {
        await result.current.fetchNotifications(true); // Force fetch
      });
      
      expect(result.current.error).toBe('Fetch error');
      expect(result.current.isLoading).toBe(false);
      
      // 2. Clear error
      act(() => {
        result.current.clearError();
      });
      
      expect(result.current.error).toBe(null);
      
      // 3. Successful fetch should not have error
      mockNotificationService.fetchNotifications.mockResolvedValueOnce(mockNotifications);
      
      await act(async () => {
        await result.current.fetchNotifications(true); // Force fetch
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.notifications).toEqual(mockNotifications);
    });

    it('should maintain state consistency during sequential operations with caching', async () => {
      const { result } = renderHook(() => useNotificationStore());
      
      // Set initial state with fresh cache
      const now = Date.now();
      act(() => {
        useNotificationStore.setState({ 
          notifications: mockNotifications,
          lastFetch: now,
          lastSummaryFetch: now - 60000 // Make summary stale so it recalculates
        });
      });
      
      // Mock mark as read operation
      mockNotificationService.markAsRead.mockResolvedValueOnce(true);
      
      const { NotificationStateUtils } = require('../../utils');
      const updatedNotifications = mockNotifications.map(n => n.id === 1 ? { ...n, isRead: true } : n);
      NotificationStateUtils.markNotificationAsRead.mockReturnValueOnce(updatedNotifications);
      
      // Execute mark as read operation first
      await act(async () => {
        await result.current.markAsRead(1);
      });
      
      // Verify notifications were updated and summary was calculated locally
      expect(result.current.notifications.find(n => n.id === 1)?.isRead).toBe(true);
      expect(result.current.summary.unread).toBe(1); // markAsRead calculates locally
      
      // Now execute fetch summary - should use cache and respect the updated state
      await act(async () => {
        await result.current.fetchSummary(false); // Don't force, use cache
      });
      
      // State should remain consistent - summary should stay the same as locally calculated
      expect(result.current.summary.unread).toBe(1); // Should remain 1 from local calculation
      expect(result.current.summary.total).toBe(3);
      expect(result.current.summary.hasUnread).toBe(true);
    });
  });
});
