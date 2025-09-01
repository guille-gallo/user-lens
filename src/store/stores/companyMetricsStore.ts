import { create } from 'zustand';
import { companyMetricsService } from '../../services';
import { CompanyMetricsErrorHandler } from '../utils';
import type { CompanyMetrics, MetricsSummary } from '../../types';

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
      
      // Fetch metrics from service
      const metrics = await companyMetricsService.getCompanyMetrics();
      
      // Process summary
      const summary = companyMetricsService.processMetricsSummary(metrics);
      
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
