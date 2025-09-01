import { create } from 'zustand';
import type { CompanyMetrics, MetricsSummary } from '../../types';
import { companyMetricsService } from '../../services';
import { CompanyMetricsErrorHandler } from '../utils';

/**
 * Async operations handler following Single Responsibility Principle
 */
class CompanyMetricsOperations {
  static async fetchAndProcessMetrics(): Promise<{ metrics: CompanyMetrics[]; summary: MetricsSummary }> {
    // Fetch metrics from service
    const metrics = await companyMetricsService.getCompanyMetrics();
    
    // Process summary (this is already optimized in the service)
    const summary = companyMetricsService.processMetricsSummary(metrics);
    
    return { metrics, summary };
  }
}

interface CompanyMetricsState {
  metrics: CompanyMetrics[];
  summary: MetricsSummary | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setMetrics: (metrics: CompanyMetrics[]) => void;
  setSummary: (summary: MetricsSummary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  fetchCompanyMetrics: () => Promise<void>;
  refreshMetrics: () => Promise<void>;
}

export const useCompanyMetricsStore = create<CompanyMetricsState>((set, get) => ({
  metrics: [],
  summary: null,
  loading: false,
  error: null,

  setMetrics: (metrics) => set({ metrics }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchCompanyMetrics: async () => {
    const { setLoading, setError, setMetrics, setSummary } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the operations handler for better separation of concerns
      const { metrics, summary } = await CompanyMetricsOperations.fetchAndProcessMetrics();
      
      setMetrics(metrics);
      setSummary(summary);
    } catch (error) {
      const errorMessage = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      CompanyMetricsErrorHandler.logError('fetch company metrics', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  },

  refreshMetrics: async () => {
    const { fetchCompanyMetrics } = get();
    await fetchCompanyMetrics();
  }
}));
