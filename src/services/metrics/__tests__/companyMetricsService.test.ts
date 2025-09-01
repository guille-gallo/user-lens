import { companyMetricsService } from '../companyMetricsService';
import type { CompanyMetrics } from '../../../types';

describe('companyMetricsService', () => {
  describe('processMetricsSummary', () => {
    it('should handle empty metrics array', () => {
      const result = companyMetricsService.processMetricsSummary([]);
      
      expect(result).toEqual({
        mostValuableCompany: { name: '', marketValue: 0, rating: 0 },
        topStockPrice: { company: '', price: 0 },
        mostValuableCompanyRating: 0
      });
    });

    it('should process single company metrics', () => {
      const metrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: 'Test Corp',
          marketValue: 1000000,
          stockPrice: 50.25,
          internalRating: 4.5
        }
      ];

      const result = companyMetricsService.processMetricsSummary(metrics);
      
      expect(result.mostValuableCompany.name).toBe('Test Corp');
      expect(result.mostValuableCompany.marketValue).toBe(1000000);
      expect(result.mostValuableCompany.rating).toBe(4.5);
      expect(result.topStockPrice.company).toBe('Test Corp');
      expect(result.topStockPrice.price).toBe(50.25);
      expect(result.mostValuableCompanyRating).toBe(4.5);
    });

    it('should identify most valuable company', () => {
      const metrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: 'Small Corp',
          marketValue: 500000,
          stockPrice: 25.50,
          internalRating: 3.5
        },
        {
          id: 2,
          companyName: 'Big Corp',
          marketValue: 2000000,
          stockPrice: 100.25,
          internalRating: 4.8
        },
        {
          id: 3,
          companyName: 'Medium Corp',
          marketValue: 1000000,
          stockPrice: 75.00,
          internalRating: 4.0
        }
      ];

      const result = companyMetricsService.processMetricsSummary(metrics);
      
      expect(result.mostValuableCompany.name).toBe('Big Corp');
      expect(result.mostValuableCompany.marketValue).toBe(2000000);
      expect(result.mostValuableCompany.rating).toBe(4.8);
    });

    it('should identify company with highest stock price', () => {
      const metrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: 'Low Stock Corp',
          marketValue: 2000000,
          stockPrice: 50.00,
          internalRating: 4.5
        },
        {
          id: 2,
          companyName: 'High Stock Corp',
          marketValue: 1000000,
          stockPrice: 150.75,
          internalRating: 3.8
        }
      ];

      const result = companyMetricsService.processMetricsSummary(metrics);
      
      expect(result.topStockPrice.company).toBe('High Stock Corp');
      expect(result.topStockPrice.price).toBe(150.75);
      // Most valuable by market value should still be Low Stock Corp
      expect(result.mostValuableCompany.name).toBe('Low Stock Corp');
    });

    it('should handle identical values', () => {
      const metrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: 'Corp A',
          marketValue: 1000000,
          stockPrice: 100.00,
          internalRating: 4.0
        },
        {
          id: 2,
          companyName: 'Corp B',
          marketValue: 1000000,
          stockPrice: 100.00,
          internalRating: 4.0
        }
      ];

      const result = companyMetricsService.processMetricsSummary(metrics);
      
      // Should return the first one found (Corp A)
      expect(result.mostValuableCompany.name).toBe('Corp A');
      expect(result.topStockPrice.company).toBe('Corp A');
      expect(result.mostValuableCompanyRating).toBe(4.0);
    });

    it('should handle zero and negative values', () => {
      const metrics: CompanyMetrics[] = [
        {
          id: 1,
          companyName: 'Zero Corp',
          marketValue: 0,
          stockPrice: 0,
          internalRating: 0
        },
        {
          id: 2,
          companyName: 'Negative Corp',
          marketValue: -100000,
          stockPrice: -10.50,
          internalRating: 1.0
        }
      ];

      const result = companyMetricsService.processMetricsSummary(metrics);
      
      expect(result.mostValuableCompany.name).toBe('Zero Corp');
      expect(result.topStockPrice.company).toBe('Zero Corp');
    });
  });
});
