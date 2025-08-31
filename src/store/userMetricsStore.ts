import { create } from 'zustand';
import type { UserMetricsSummary } from '../services/userMetricsService';
import { userMetricsService } from '../services/userMetricsService';
import type { User } from '../services/userService';

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
      
      const summary = userMetricsService.processUserMetrics(users);
      setSummary(summary);
    } catch (error) {
      console.error('Failed to process user metrics:', error);
      setError(error instanceof Error ? error.message : 'Failed to process user metrics');
    } finally {
      setLoading(false);
    }
  },

  refreshMetrics: (users: User[]) => {
    const { processUserMetrics } = get();
    processUserMetrics(users);
  }
}));
