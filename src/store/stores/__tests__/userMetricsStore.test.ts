import { renderHook, act } from '@testing-library/react';
import { useUserMetricsStore } from '../userMetricsStore';
import type { UserMetricsSummary, User } from '../../../types';

// Mock dependencies
jest.mock('../../utils', () => ({
  UserMetricsCache: {
    processUserMetrics: jest.fn(),
    clearCache: jest.fn(),
  },
  UserMetricsErrorHandler: {
    handleUserMetricsError: jest.fn(),
    logError: jest.fn(),
  },
}));

const { UserMetricsCache, UserMetricsErrorHandler } = require('../../utils');

describe('userMetricsStore', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      website: 'johndoe.com',
      address: {
        street: '123 Main St',
        suite: 'Apt 4B',
        city: 'New York',
        zipcode: '10001',
        geo: { lat: '40.7128', lng: '-74.0060' }
      },
      company: {
        name: 'TechCorp',
        catchPhrase: 'Innovation at its best',
        bs: 'cutting-edge solutions'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      phone: '+1-555-987-6543',
      website: 'janesmith.com',
      address: {
        street: '456 Oak Ave',
        suite: 'Suite 2A',
        city: 'Los Angeles',
        zipcode: '90210',
        geo: { lat: '34.0522', lng: '-118.2437' }
      },
      company: {
        name: 'DesignCo',
        catchPhrase: 'Creative solutions',
        bs: 'user experience design'
      }
    },
    {
      id: 3,
      name: 'Bob Wilson',
      username: 'bobwilson',
      email: 'bob@example.com',
      phone: '+1-555-456-7890',
      website: 'bobwilson.com',
      address: {
        street: '789 Pine St',
        suite: 'Floor 3',
        city: 'Chicago',
        zipcode: '60601',
        geo: { lat: '41.8781', lng: '-87.6298' }
      },
      company: {
        name: 'TechCorp',
        catchPhrase: 'Innovation at its best',
        bs: 'cutting-edge solutions'
      }
    }
  ];

  const mockSummary: UserMetricsSummary = {
    totalUsers: 3,
    activeUsers: {
      count: 2,
      percentage: 66.7
    },
    userGrowth: {
      newUsers: 1,
      growthRate: 50.0
    },
    topCompany: {
      name: 'TechCorp',
      userCount: 2
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state before each test
    useUserMetricsStore.setState({
      summary: null,
      loading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      expect(result.current.summary).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Synchronous Actions', () => {
    it('should set summary', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.setSummary(mockSummary);
      });
      
      expect(result.current.summary).toEqual(mockSummary);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      const errorMessage = 'Processing failed';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear summary when set to null', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.setSummary(mockSummary);
      });
      
      expect(result.current.summary).toEqual(mockSummary);
      
      act(() => {
        result.current.setSummary(null);
      });
      
      expect(result.current.summary).toBe(null);
    });
  });

  describe('processUserMetrics', () => {
    it('should process user metrics successfully', () => {
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBe(null);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle processing error', () => {
      const error = new Error('Processing failed');
      const errorMessage = 'Failed to process metrics';
      
      UserMetricsCache.processUserMetrics.mockImplementation(() => {
        throw error;
      });
      UserMetricsErrorHandler.handleUserMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.summary).toBe(null);
      expect(UserMetricsErrorHandler.handleUserMetricsError).toHaveBeenCalledWith(error);
      expect(UserMetricsErrorHandler.logError).toHaveBeenCalledWith('process user metrics', error);
    });

    it('should set loading state during processing', () => {
      UserMetricsCache.processUserMetrics.mockImplementation(() => {
        const { result } = renderHook(() => useUserMetricsStore());
        expect(result.current.loading).toBe(true);
        return mockSummary;
      });
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.loading).toBe(false);
    });

    it('should clear error before processing', () => {
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      // Set initial error
      act(() => {
        result.current.setError('Previous error');
      });
      
      expect(result.current.error).toBe('Previous error');
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should process empty user array', () => {
      const emptySummary: UserMetricsSummary = {
        totalUsers: 0,
        activeUsers: { count: 0, percentage: 0 },
        userGrowth: { newUsers: 0, growthRate: 0 },
        topCompany: { name: '', userCount: 0 }
      };
      
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(emptySummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics([]);
      });
      
      expect(result.current.summary).toEqual(emptySummary);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledWith([]);
    });
  });

  describe('refreshMetrics', () => {
    it('should clear cache and reprocess metrics', () => {
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.refreshMetrics(mockUsers);
      });
      
      expect(UserMetricsCache.clearCache).toHaveBeenCalledTimes(1);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledWith(mockUsers);
      expect(result.current.summary).toEqual(mockSummary);
    });

    it('should handle refresh error', () => {
      const error = new Error('Refresh failed');
      const errorMessage = 'Failed to refresh metrics';
      
      UserMetricsCache.processUserMetrics.mockImplementation(() => {
        throw error;
      });
      UserMetricsErrorHandler.handleUserMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.refreshMetrics(mockUsers);
      });
      
      expect(UserMetricsCache.clearCache).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBe(errorMessage);
    });

    it('should refresh with updated user data', () => {
      const updatedUsers = [...mockUsers, {
        id: 4,
        name: 'Alice Johnson',
        username: 'alicej',
        email: 'alice@example.com',
        phone: '+1-555-111-2222',
        website: 'alicej.com',
        address: mockUsers[0].address,
        company: {
          name: 'StartupCo',
          catchPhrase: 'Disrupting industries',
          bs: 'scalable solutions'
        }
      }];
      
      const updatedSummary: UserMetricsSummary = {
        ...mockSummary,
        totalUsers: 4,
        topCompany: {
          name: 'TechCorp',
          userCount: 2
        }
      };
      
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(updatedSummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.refreshMetrics(updatedUsers);
      });
      
      expect(result.current.summary).toEqual(updatedSummary);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledWith(updatedUsers);
    });
  });

  describe('Error Handling', () => {
    it('should maintain error state until cleared', () => {
      const error = new Error('Processing failed');
      const errorMessage = 'Failed to process metrics';
      
      UserMetricsCache.processUserMetrics.mockImplementation(() => {
        throw error;
      });
      UserMetricsErrorHandler.handleUserMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe(errorMessage);
      
      // Error should persist until explicitly cleared
      expect(result.current.error).toBe(errorMessage);
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should handle consecutive errors', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      const errorMessage1 = 'First error message';
      const errorMessage2 = 'Second error message';
      
      UserMetricsCache.processUserMetrics
        .mockImplementationOnce(() => { throw error1; })
        .mockImplementationOnce(() => { throw error2; });
      
      UserMetricsErrorHandler.handleUserMetricsError
        .mockReturnValueOnce(errorMessage1)
        .mockReturnValueOnce(errorMessage2);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe(errorMessage1);
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe(errorMessage2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full metrics workflow', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      // 1. Initial processing
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBe(null);
      
      // 2. Refresh with new data
      const updatedSummary = { ...mockSummary, totalUsers: 4 };
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(updatedSummary);
      
      act(() => {
        result.current.refreshMetrics([...mockUsers, mockUsers[0]]);
      });
      
      expect(UserMetricsCache.clearCache).toHaveBeenCalled();
      expect(result.current.summary).toEqual(updatedSummary);
    });

    it('should recover from error state', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      // 1. Process with error
      const error = new Error('Processing failed');
      UserMetricsCache.processUserMetrics.mockImplementationOnce(() => {
        throw error;
      });
      UserMetricsErrorHandler.handleUserMetricsError.mockReturnValueOnce('Processing failed');
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe('Processing failed');
      expect(result.current.summary).toBe(null);
      
      // 2. Successful reprocessing
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.summary).toEqual(mockSummary);
    });

    it('should handle state transitions correctly', () => {
      const { result } = renderHook(() => useUserMetricsStore());
      
      // Initial state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.summary).toBe(null);
      
      // Set loading manually
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      
      // Process metrics (should clear loading)
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(mockSummary);
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.summary).toEqual(mockSummary);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large user datasets', () => {
      const largeUserSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockUsers[0],
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`
      }));
      
      const largeSummary: UserMetricsSummary = {
        totalUsers: 1000,
        activeUsers: { count: 800, percentage: 80 },
        userGrowth: { newUsers: 200, growthRate: 25 },
        topCompany: { name: 'TechCorp', userCount: 500 }
      };
      
      UserMetricsCache.processUserMetrics.mockReturnValueOnce(largeSummary);
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(largeUserSet);
      });
      
      expect(result.current.summary).toEqual(largeSummary);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledWith(largeUserSet);
    });

    it('should handle rapid successive calls', () => {
      UserMetricsCache.processUserMetrics
        .mockReturnValueOnce(mockSummary)
        .mockReturnValueOnce({ ...mockSummary, totalUsers: 4 })
        .mockReturnValueOnce({ ...mockSummary, totalUsers: 5 });
      
      const { result } = renderHook(() => useUserMetricsStore());
      
      act(() => {
        result.current.processUserMetrics(mockUsers);
        result.current.processUserMetrics([...mockUsers, mockUsers[0]]);
        result.current.processUserMetrics([...mockUsers, mockUsers[0], mockUsers[1]]);
      });
      
      expect(result.current.summary?.totalUsers).toBe(5);
      expect(UserMetricsCache.processUserMetrics).toHaveBeenCalledTimes(3);
    });
  });
});
