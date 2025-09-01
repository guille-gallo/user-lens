import { renderHook, act } from '@testing-library/react';
import { useCompanyMetricsStore } from '../companyMetricsStore';
import { companyMetricsService } from '../../../services';
import type { CompanyMetrics, MetricsSummary } from '../../../types';

// Mock dependencies
jest.mock('../../../services', () => ({
  companyMetricsService: {
    getCompanyMetrics: jest.fn(),
    processMetricsSummary: jest.fn(),
  },
}));

jest.mock('../../utils', () => ({
  CompanyMetricsErrorHandler: {
    handleCompanyMetricsError: jest.fn(),
    logError: jest.fn(),
  },
}));

const mockCompanyMetricsService = companyMetricsService as jest.Mocked<typeof companyMetricsService>;
const { CompanyMetricsErrorHandler } = require('../../utils');

describe('companyMetricsStore', () => {
  const mockMetrics: CompanyMetrics[] = [
    {
      id: 1,
      companyName: 'TechCorp',
      marketValue: 1000000000,
      stockPrice: 150.50,
      internalRating: 4.5
    },
    {
      id: 2,
      companyName: 'DesignCo',
      marketValue: 750000000,
      stockPrice: 125.25,
      internalRating: 4.2
    },
    {
      id: 3,
      companyName: 'StartupCo',
      marketValue: 250000000,
      stockPrice: 85.00,
      internalRating: 3.8
    }
  ];

  const mockSummary: MetricsSummary = {
    mostValuableCompany: {
      name: 'TechCorp',
      marketValue: 1000000000,
      rating: 4.5
    },
    topStockPrice: {
      company: 'TechCorp',
      price: 150.50
    },
    mostValuableCompanyRating: 4.5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset all mock implementations completely
    mockCompanyMetricsService.getCompanyMetrics.mockReset();
    mockCompanyMetricsService.processMetricsSummary.mockReset();
    CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReset();
    CompanyMetricsErrorHandler.logError.mockReset();
    
    // Reset store state before each test - more thorough reset
    const store = useCompanyMetricsStore.getState();
    store.setMetrics([]);
    store.setSummary(null);
    store.setLoading(false);
    store.setError(null);
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Synchronous Actions', () => {
    it('should set metrics', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      act(() => {
        result.current.setMetrics(mockMetrics);
      });
      
      expect(result.current.metrics).toEqual(mockMetrics);
    });

    it('should set summary', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      act(() => {
        result.current.setSummary(mockSummary);
      });
      
      expect(result.current.summary).toEqual(mockSummary);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      const errorMessage = 'Processing failed';
      
      act(() => {
        result.current.setError(errorMessage);
      });
      
      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear summary when set to null', () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
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

  describe('fetchCompanyMetrics', () => {
    it('should fetch company metrics successfully', async () => {
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBe(null);
      expect(mockCompanyMetricsService.getCompanyMetrics).toHaveBeenCalledTimes(1);
      expect(mockCompanyMetricsService.processMetricsSummary).toHaveBeenCalledWith(mockMetrics);
    });

    it('should handle fetch metrics error', async () => {
      const error = new Error('Network error');
      const errorMessage = 'Failed to fetch company metrics';
      
      mockCompanyMetricsService.getCompanyMetrics.mockRejectedValueOnce(error);
      CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toBe(null);
      expect(CompanyMetricsErrorHandler.handleCompanyMetricsError).toHaveBeenCalledWith(error);
      expect(CompanyMetricsErrorHandler.logError).toHaveBeenCalledWith('fetch company metrics', error);
    });

    it('should handle processing summary error', async () => {
      const error = new Error('Processing error');
      const errorMessage = 'Failed to process metrics summary';
      
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockImplementation(() => {
        throw error;
      });
      CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toBe(null);
    });

    it('should set loading state during fetch', async () => {
      mockCompanyMetricsService.getCompanyMetrics.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => resolve(mockMetrics), 100);
        })
      );
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      act(() => {
        result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });

    it('should clear error before fetching', async () => {
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      // Set initial error
      act(() => {
        result.current.setError('Previous error');
      });
      
      expect(result.current.error).toBe('Previous error');
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should handle empty metrics array', async () => {
      const emptySummary: MetricsSummary = {
        mostValuableCompany: { name: '', marketValue: 0, rating: 0 },
        topStockPrice: { company: '', price: 0 },
        mostValuableCompanyRating: 0
      };
      
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce([]);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(emptySummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toEqual(emptySummary);
      expect(mockCompanyMetricsService.processMetricsSummary).toHaveBeenCalledWith([]);
    });
  });

  describe('refreshMetrics', () => {
    it('should refresh metrics by calling fetchCompanyMetrics', async () => {
      // Set up mocks in the correct order - getCompanyMetrics will be called first
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(mockSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.refreshMetrics();
      });
      
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.summary).toEqual(mockSummary);
      expect(mockCompanyMetricsService.getCompanyMetrics).toHaveBeenCalledTimes(1);
      expect(mockCompanyMetricsService.processMetricsSummary).toHaveBeenCalledWith(mockMetrics);
    });

    it('should handle refresh error', async () => {
      const error = new Error('Refresh failed');
      const errorMessage = 'Failed to refresh metrics';
      
      mockCompanyMetricsService.getCompanyMetrics.mockRejectedValueOnce(error);
      CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.refreshMetrics();
      });
      
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should refresh with updated data', async () => {
      const updatedMetrics = [
        ...mockMetrics,
        {
          id: 4,
          companyName: 'NewCorp',
          marketValue: 500000000,
          stockPrice: 100.00,
          internalRating: 4.0
        }
      ];
      
      const updatedSummary: MetricsSummary = {
        ...mockSummary,
        mostValuableCompany: {
          name: 'TechCorp',
          marketValue: 1000000000,
          rating: 4.5
        }
      };
      
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(updatedMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(updatedSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.refreshMetrics();
      });
      
      expect(result.current.metrics).toEqual(updatedMetrics);
      expect(result.current.summary).toEqual(updatedSummary);
    });
  });

  describe('Error Handling', () => {
    it('should maintain error state until cleared', async () => {
      const error = new Error('Fetch failed');
      const errorMessage = 'Failed to fetch company metrics';
      
      mockCompanyMetricsService.getCompanyMetrics.mockRejectedValueOnce(error);
      CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReturnValueOnce(errorMessage);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe(errorMessage);
      
      // Error should persist until explicitly cleared
      expect(result.current.error).toBe(errorMessage);
      
      act(() => {
        result.current.setError(null);
      });
      
      expect(result.current.error).toBe(null);
    });

    it('should handle consecutive errors', async () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');
      const errorMessage1 = 'First error message';
      const errorMessage2 = 'Second error message';
      
      mockCompanyMetricsService.getCompanyMetrics
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2);
      
      CompanyMetricsErrorHandler.handleCompanyMetricsError
        .mockReturnValueOnce(errorMessage1)
        .mockReturnValueOnce(errorMessage2);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe(errorMessage1);
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe(errorMessage2);
    });
  });

  describe('Integration Tests', () => {
    it('should handle full metrics workflow', async () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      // 1. Initial fetch
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockImplementationOnce(() => mockSummary);
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.error).toBe(null);
      
      // 2. Refresh with new data
      const updatedSummary = { ...mockSummary, mostValuableCompanyRating: 4.6 };
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockImplementationOnce(() => updatedSummary);
      
      await act(async () => {
        await result.current.refreshMetrics();
      });
      
      expect(result.current.summary).toEqual(updatedSummary);
      expect(mockCompanyMetricsService.getCompanyMetrics).toHaveBeenCalledTimes(2);
    });

    it('should recover from error state', async () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      // 1. Fetch with error
      const error = new Error('Network error');
      mockCompanyMetricsService.getCompanyMetrics.mockRejectedValueOnce(error);
      CompanyMetricsErrorHandler.handleCompanyMetricsError.mockReturnValueOnce('Network error');
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe('Network error');
      // Metrics should remain as they were (empty initially since we start with empty state)
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toBe(null);
      
      // 2. Successful re-fetch
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(mockSummary);
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.error).toBe(null);
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.summary).toEqual(mockSummary);
    });

    it('should handle state transitions correctly', async () => {
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      // Initial state
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.metrics).toEqual([]);
      expect(result.current.summary).toBe(null);
      
      // Set loading manually
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.loading).toBe(true);
      
      // Fetch metrics (should manage loading state)
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(mockMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockImplementationOnce(() => mockSummary);
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.metrics).toEqual(mockMetrics);
      expect(result.current.summary).toEqual(mockSummary);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large metrics datasets', async () => {
      const largeMetrics = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        companyName: `Company ${i + 1}`,
        marketValue: 100000000 + (i * 1000000), // Deterministic values
        stockPrice: 100 + (i * 1.5),
        internalRating: 1 + (i % 5)
      }));
      
      const largeSummary: MetricsSummary = {
        mostValuableCompany: {
          name: 'Company 100',
          marketValue: 199000000,
          rating: 5
        },
        topStockPrice: {
          company: 'Company 100',
          price: 248.5
        },
        mostValuableCompanyRating: 5
      };
      
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(largeMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(largeSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.metrics).toEqual(largeMetrics);
      expect(result.current.summary).toEqual(largeSummary);
    });

    it('should handle rapid successive calls', async () => {
      // Set up enough mocks for all expected calls
      // fetchCompanyMetrics + refreshMetrics (which calls fetchCompanyMetrics) + fetchCompanyMetrics = 3 calls total
      mockCompanyMetricsService.getCompanyMetrics
        .mockResolvedValue(mockMetrics);
      
      mockCompanyMetricsService.processMetricsSummary
        .mockReturnValue(mockSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      // Test rapid successive calls
      await act(async () => {
        await Promise.all([
          result.current.fetchCompanyMetrics(),
          result.current.refreshMetrics(),
          result.current.fetchCompanyMetrics()
        ]);
      });
      
      // Verify that all calls were made
      expect(mockCompanyMetricsService.getCompanyMetrics).toHaveBeenCalledTimes(3);
      // Final state should have valid summary
      expect(result.current.summary).toBeDefined();
      expect(result.current.summary).toEqual(mockSummary);
      expect(result.current.metrics).toEqual(mockMetrics);
    });

    it('should handle metrics with edge case values', async () => {
      // Clear any previous mock setup
      jest.clearAllMocks();
      mockCompanyMetricsService.getCompanyMetrics.mockReset();
      mockCompanyMetricsService.processMetricsSummary.mockReset();
      
      const edgeCaseMetrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: '',
          marketValue: 0,
          stockPrice: 0,
          internalRating: 0
        },
        {
          id: 2,
          companyName: 'MaxCorp',
          marketValue: Number.MAX_SAFE_INTEGER,
          stockPrice: 999999.99,
          internalRating: 5.0
        }
      ];
      
      const edgeCaseSummary: MetricsSummary = {
        mostValuableCompany: {
          name: 'MaxCorp',
          marketValue: Number.MAX_SAFE_INTEGER,
          rating: 5.0
        },
        topStockPrice: {
          company: 'MaxCorp',
          price: 999999.99
        },
        mostValuableCompanyRating: 5.0
      };
      
      mockCompanyMetricsService.getCompanyMetrics.mockResolvedValueOnce(edgeCaseMetrics);
      mockCompanyMetricsService.processMetricsSummary.mockReturnValueOnce(edgeCaseSummary);
      
      const { result } = renderHook(() => useCompanyMetricsStore());
      
      await act(async () => {
        await result.current.fetchCompanyMetrics();
      });
      
      expect(result.current.metrics).toEqual(edgeCaseMetrics);
      expect(result.current.summary).toEqual(edgeCaseSummary);
    });
  });
});
