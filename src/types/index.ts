/**
 * Shared type definitions for the User Lens application
 * Extracted from individual service files for better organization
 */

// ===== USER TYPES =====
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

// ===== NOTIFICATION TYPES =====
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  hasUnread: boolean;
}

// ===== METRICS TYPES =====
export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  activeUsersPercentage: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  averageUsersPerCompany: number;
  topCompanyByUsers: {
    name: string;
    userCount: number;
  };
}

export interface UserMetricsSummary {
  totalUsers: number;
  activeUsers: {
    count: number;
    percentage: number;
  };
  userGrowth: {
    newUsers: number;
    growthRate: number;
  };
  topCompany: {
    name: string;
    userCount: number;
  };
}

export interface CompanyMetrics {
  id: number;
  companyName: string;
  marketValue: number;
  stockPrice: number;
  internalRating: number;
}

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

// ===== SERVICE INTERFACES =====
export interface IUserService {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User>;
  createUser(userData: Omit<User, 'id'>): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
}

export interface INotificationService {
  fetchNotifications(): Promise<Notification[]>;
  getSummary(notifications: Notification[]): NotificationSummary;
  markAsRead(id: number): Promise<Notification>;
  markAllAsRead(): Promise<Notification[]>;
  deleteNotification(id: number): Promise<void>;
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
