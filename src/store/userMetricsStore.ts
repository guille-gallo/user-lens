import { create } from 'zustand';
import type { UserMetricsSummary, User } from '../types';
import { UserMetricsCache, UserMetricsErrorHandler } from './utils';

interface UserMetricsState {
  summary: UserMetricsSummary | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setSummary: (summary: UserMetricsSummary | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  processUserMetrics: (users: User[]) => void;
  refreshMetrics: (users: User[]) => void;
}

export const useUserMetricsStore = create<UserMetricsState>((set, get) => ({
  summary: null,
  loading: false,
  error: null,

  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  processUserMetrics: (users: User[]) => {
    const { setLoading, setError, setSummary } = get();
    
    try {
      setLoading(true);
      setError(null);
      
      // Use performance-optimized cache
      const summary = UserMetricsCache.processUserMetrics(users);
      setSummary(summary);
    } catch (error) {
      const errorMessage = UserMetricsErrorHandler.handleUserMetricsError(error);
      UserMetricsErrorHandler.logError('process user metrics', error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  },

  refreshMetrics: (users: User[]) => {
    // Clear cache to force recomputation
    UserMetricsCache.clearCache();
    const { processUserMetrics } = get();
    processUserMetrics(users);
  }
}));
