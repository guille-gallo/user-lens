import { API_CONFIG } from '../../constants/api';
import { BaseHttpService } from '../http/httpService';
import type { CompanyMetrics, MetricsSummary } from '../../types';

/**
 * Company Metrics Service
 */
class CompanyMetricsService extends BaseHttpService {
  constructor() {
    super(API_CONFIG.LOCAL_API);
  }

  // Get all company metrics from JSON Server
  async getCompanyMetrics(): Promise<CompanyMetrics[]> {
    return this.get<CompanyMetrics[]>('/company-metrics');
  }

  // Process metrics to create summary data for the cards
  // Pure function - no side effects, easily testable
  processMetricsSummary(metrics: CompanyMetrics[]): MetricsSummary {
    if (!metrics.length) {
      return {
        mostValuableCompany: { name: '', marketValue: 0, rating: 0 },
        topStockPrice: { company: '', price: 0 },
        mostValuableCompanyRating: 0
      };
    }

    // Performance optimization: single pass through data
    let mostValuable = metrics[0];
    let topStock = metrics[0];

    for (const metric of metrics) {
      if (metric.marketValue > mostValuable.marketValue) {
        mostValuable = metric;
      }
      if (metric.stockPrice > topStock.stockPrice) {
        topStock = metric;
      }
    }

    return {
      mostValuableCompany: {
        name: mostValuable.companyName,
        marketValue: mostValuable.marketValue,
        rating: mostValuable.internalRating
      },
      topStockPrice: {
        company: topStock.companyName,
        price: topStock.stockPrice
      },
      mostValuableCompanyRating: mostValuable.internalRating
    };
  }
}

// Export singleton instance for performance
export const companyMetricsService = new CompanyMetricsService();
