// API Services
export { userService } from './api/userService';
export { NotificationService } from './api/notificationService';

// Metrics Services
export { userMetricsService } from './metrics/userMetricsService';
export { companyMetricsService } from './metrics/companyMetricsService';

// HTTP Services
export { BaseHttpService, fetchWithTimeout } from './http/httpService';
export type { RequestOptions } from './http/httpService';

// Re-export types from centralized types directory
export type { 
  User, 
  Notification, 
  NotificationSummary,
  UserMetrics,
  UserMetricsSummary,
  CompanyMetrics,
  MetricsSummary,
  IUserService,
  INotificationService,
  ApiResponse,
  PaginatedResponse
} from '../types';
