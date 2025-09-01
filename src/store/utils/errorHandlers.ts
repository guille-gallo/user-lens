/**
 * Centralized error handling utilities for stores
 * Following Single Responsibility Principle
 */

export class StoreErrorHandler {
  static handleError(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  }

  static logError(operation: string, error: unknown): void {
    console.error(`Failed to ${operation}:`, error);
  }
}

export class UserMetricsErrorHandler extends StoreErrorHandler {
  static handleUserMetricsError(error: unknown): string {
    return this.handleError(error, 'Failed to process user metrics');
  }
}

export class NotificationErrorHandler extends StoreErrorHandler {
  static handleNotificationError(error: unknown): string {
    return this.handleError(error, 'Failed to process notifications');
  }
}

export class CompanyMetricsErrorHandler extends StoreErrorHandler {
  static handleCompanyMetricsError(error: unknown): string {
    return this.handleError(error, 'Failed to process company metrics');
  }
}
