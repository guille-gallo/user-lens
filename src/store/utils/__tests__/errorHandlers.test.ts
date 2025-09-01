import { StoreErrorHandler, UserMetricsErrorHandler, NotificationErrorHandler, CompanyMetricsErrorHandler } from '../errorHandlers';

describe('StoreErrorHandler', () => {
  describe('handleError', () => {
    it('should return error message when error is an Error instance', () => {
      const error = new Error('Something went wrong');
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Something went wrong');
    });

    it('should return default message when error is not an Error instance', () => {
      const error = 'string error';
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Default message');
    });

    it('should return default message when error is null', () => {
      const error = null;
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Default message');
    });

    it('should return default message when error is undefined', () => {
      const error = undefined;
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Default message');
    });

    it('should handle TypeError instances correctly', () => {
      const error = new TypeError('Type error occurred');
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Type error occurred');
    });

    it('should handle custom Error instances correctly', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error occurred');
      const result = StoreErrorHandler.handleError(error, 'Default message');
      
      expect(result).toBe('Custom error occurred');
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      const operation = 'test operation';
      
      StoreErrorHandler.logError(operation, error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to test operation:', error);
      
      consoleSpy.mockRestore();
    });

    it('should log non-Error objects to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = { message: 'Object error' };
      const operation = 'test operation';
      
      StoreErrorHandler.logError(operation, error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to test operation:', error);
      
      consoleSpy.mockRestore();
    });

    it('should log with different operation names', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      
      StoreErrorHandler.logError('fetch users', error);
      StoreErrorHandler.logError('update profile', error);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch users:', error);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to update profile:', error);
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });
  });
});

describe('UserMetricsErrorHandler', () => {
  describe('handleUserMetricsError', () => {
    it('should return error message when error is an Error instance', () => {
      const error = new Error('Metrics calculation failed');
      const result = UserMetricsErrorHandler.handleUserMetricsError(error);
      
      expect(result).toBe('Metrics calculation failed');
    });

    it('should return default message when error is not an Error instance', () => {
      const error = 'string error';
      const result = UserMetricsErrorHandler.handleUserMetricsError(error);
      
      expect(result).toBe('Failed to process user metrics');
    });

    it('should return default message when error is null', () => {
      const error = null;
      const result = UserMetricsErrorHandler.handleUserMetricsError(error);
      
      expect(result).toBe('Failed to process user metrics');
    });

    it('should handle network errors correctly', () => {
      const error = new Error('Network request failed');
      const result = UserMetricsErrorHandler.handleUserMetricsError(error);
      
      expect(result).toBe('Network request failed');
    });

    it('should inherit from StoreErrorHandler functionality', () => {
      // Test that it uses the parent class method
      const error = new TypeError('Invalid metrics data');
      const result = UserMetricsErrorHandler.handleUserMetricsError(error);
      
      expect(result).toBe('Invalid metrics data');
    });
  });
});

describe('NotificationErrorHandler', () => {
  describe('handleNotificationError', () => {
    it('should return error message when error is an Error instance', () => {
      const error = new Error('Notification service unavailable');
      const result = NotificationErrorHandler.handleNotificationError(error);
      
      expect(result).toBe('Notification service unavailable');
    });

    it('should return default message when error is not an Error instance', () => {
      const error = 'string error';
      const result = NotificationErrorHandler.handleNotificationError(error);
      
      expect(result).toBe('Failed to process notifications');
    });

    it('should return default message when error is null', () => {
      const error = null;
      const result = NotificationErrorHandler.handleNotificationError(error);
      
      expect(result).toBe('Failed to process notifications');
    });

    it('should handle API errors correctly', () => {
      const error = new Error('401 Unauthorized');
      const result = NotificationErrorHandler.handleNotificationError(error);
      
      expect(result).toBe('401 Unauthorized');
    });

    it('should inherit from StoreErrorHandler functionality', () => {
      const error = new RangeError('Invalid notification ID');
      const result = NotificationErrorHandler.handleNotificationError(error);
      
      expect(result).toBe('Invalid notification ID');
    });
  });
});

describe('CompanyMetricsErrorHandler', () => {
  describe('handleCompanyMetricsError', () => {
    it('should return error message when error is an Error instance', () => {
      const error = new Error('Company data not found');
      const result = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      
      expect(result).toBe('Company data not found');
    });

    it('should return default message when error is not an Error instance', () => {
      const error = 'string error';
      const result = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      
      expect(result).toBe('Failed to process company metrics');
    });

    it('should return default message when error is null', () => {
      const error = null;
      const result = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      
      expect(result).toBe('Failed to process company metrics');
    });

    it('should handle database errors correctly', () => {
      const error = new Error('Database connection timeout');
      const result = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      
      expect(result).toBe('Database connection timeout');
    });

    it('should inherit from StoreErrorHandler functionality', () => {
      const error = new SyntaxError('Invalid company metrics format');
      const result = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
      
      expect(result).toBe('Invalid company metrics format');
    });
  });
});

describe('Error Handler Integration', () => {
  it('should maintain consistent behavior across all handlers', () => {
    const error = new Error('Common error');
    
    const storeResult = StoreErrorHandler.handleError(error, 'Store default');
    const userMetricsResult = UserMetricsErrorHandler.handleUserMetricsError(error);
    const notificationResult = NotificationErrorHandler.handleNotificationError(error);
    const companyResult = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
    
    // All should return the error message
    expect(storeResult).toBe('Common error');
    expect(userMetricsResult).toBe('Common error');
    expect(notificationResult).toBe('Common error');
    expect(companyResult).toBe('Common error');
  });

  it('should maintain consistent default behavior across all handlers', () => {
    const error = 'not an error object';
    
    const userMetricsResult = UserMetricsErrorHandler.handleUserMetricsError(error);
    const notificationResult = NotificationErrorHandler.handleNotificationError(error);
    const companyResult = CompanyMetricsErrorHandler.handleCompanyMetricsError(error);
    
    // All should return their specific default messages
    expect(userMetricsResult).toBe('Failed to process user metrics');
    expect(notificationResult).toBe('Failed to process notifications');
    expect(companyResult).toBe('Failed to process company metrics');
  });

  it('should handle complex error objects consistently', () => {
    const complexError = {
      message: 'Complex error',
      code: 500,
      details: 'Server error'
    };
    
    const userMetricsResult = UserMetricsErrorHandler.handleUserMetricsError(complexError);
    const notificationResult = NotificationErrorHandler.handleNotificationError(complexError);
    const companyResult = CompanyMetricsErrorHandler.handleCompanyMetricsError(complexError);
    
    // All should return their default messages since it's not an Error instance
    expect(userMetricsResult).toBe('Failed to process user metrics');
    expect(notificationResult).toBe('Failed to process notifications');
    expect(companyResult).toBe('Failed to process company metrics');
  });
});
