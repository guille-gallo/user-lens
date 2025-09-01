import type { UserMetricsSummary, User } from '../../types';
import { userMetricsService } from '../../services';

/**
 * Performance optimization cache for user metrics
 * Avoids recomputation with identical input data
 */
export class UserMetricsCache {
  private static lastUsers: User[] = [];
  private static cachedSummary: UserMetricsSummary | null = null;

  static processUserMetrics(users: User[]): UserMetricsSummary {
    // Performance optimization: return cached result if users haven't changed
    if (users === this.lastUsers && this.cachedSummary) {
      return this.cachedSummary;
    }

    const summary = userMetricsService.processUserMetrics(users);
    
    // Cache for future calls
    this.lastUsers = users;
    this.cachedSummary = summary;
    
    return summary;
  }

  static clearCache(): void {
    this.lastUsers = [];
    this.cachedSummary = null;
  }
}
