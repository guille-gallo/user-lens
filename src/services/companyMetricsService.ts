// Company metrics interface for the mock data
export interface CompanyMetrics {
  id: number;
  companyName: string;
  marketValue: number;
  stockPrice: number;
  internalRating: number;
}

// Aggregated metrics for display
export interface MetricsSummary {
  mostValuableCompany: {
    name: string;
    marketValue: number;
    rating: number;
  };
  topStockPrice: {
    company: string;
    price: number;
  };
  mostValuableCompanyRating: number;
}

// JSON Server base URL (separate from JSONPlaceholder)
const JSON_SERVER_BASE_URL = 'http://localhost:3001';

export const companyMetricsService = {
  // Get all company metrics from JSON Server
  getCompanyMetrics: async (): Promise<CompanyMetrics[]> => {
    const response = await fetch(`${JSON_SERVER_BASE_URL}/company-metrics`);
    if (!response.ok) {
      throw new Error('Failed to fetch company metrics');
    }
    return response.json();
  },

  // Process metrics to create summary data for the cards
  processMetricsSummary: (metrics: CompanyMetrics[]): MetricsSummary => {
    if (!metrics.length) {
      return {
        mostValuableCompany: { name: '', marketValue: 0, rating: 0 },
        topStockPrice: { company: '', price: 0 },
        mostValuableCompanyRating: 0
      };
    }

    // Find most valuable company by market value
    const mostValuable = metrics.reduce((prev, current) => 
      prev.marketValue > current.marketValue ? prev : current
    );

    // Find highest stock price
    const topStock = metrics.reduce((prev, current) => 
      prev.stockPrice > current.stockPrice ? prev : current
    );

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
};
