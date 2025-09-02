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
  });

  describe('refreshMetrics', () => {
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

  describe('Performance and Edge Cases', () => {
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
  });
});
