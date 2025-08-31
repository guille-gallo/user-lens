import { create } from 'zustand';
import type { CompanyMetrics, MetricsSummary } from '../services/companyMetricsService';
import { companyMetricsService } from '../services/companyMetricsService';

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
      
      const metrics = await companyMetricsService.getCompanyMetrics();
      const summary = companyMetricsService.processMetricsSummary(metrics);
      
      setMetrics(metrics);
      setSummary(summary);
    } catch (error) {
      console.error('Failed to fetch company metrics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch company metrics');
    } finally {
      setLoading(false);
    }
  },

  refreshMetrics: async () => {
    const { fetchCompanyMetrics } = get();
    await fetchCompanyMetrics();
  }
}));
