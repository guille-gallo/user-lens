import { formatFieldName, getNestedValue, debounce } from '../dataTransforms';

describe('dataTransforms utilities', () => {
  describe('formatFieldName', () => {
    it('should format simple field names', () => {
      expect(formatFieldName('name')).toBe('Name');
      expect(formatFieldName('email')).toBe('Email');
      expect(formatFieldName('phone')).toBe('Phone');
    });

    it('should format nested field names', () => {
      expect(formatFieldName('address.street')).toBe('Address Street');
      expect(formatFieldName('company.name')).toBe('Company Name');
      expect(formatFieldName('address.geo.lat')).toBe('Address Geo Lat');
    });

    it('should handle empty strings', () => {
      expect(formatFieldName('')).toBe('');
    });

    it('should handle multiple dots', () => {
      expect(formatFieldName('user.profile.settings.theme')).toBe('User Profile Settings Theme');
    });
  });

  describe('getNestedValue', () => {
    const testObject = {
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        geo: {
          lat: '40.7128',
          lng: '-74.0060'
        }
      },
      company: {
        name: 'Test Corp'
      }
    };

    it('should get simple property values', () => {
      expect(getNestedValue(testObject, 'name')).toBe('John');
    });

    it('should get nested property values', () => {
      expect(getNestedValue(testObject, 'address.street')).toBe('123 Main St');
      expect(getNestedValue(testObject, 'address.city')).toBe('Anytown');
      expect(getNestedValue(testObject, 'company.name')).toBe('Test Corp');
    });

    it('should get deeply nested values', () => {
      expect(getNestedValue(testObject, 'address.geo.lat')).toBe('40.7128');
      expect(getNestedValue(testObject, 'address.geo.lng')).toBe('-74.0060');
    });

    it('should return undefined for non-existent paths', () => {
      expect(getNestedValue(testObject, 'nonexistent')).toBeUndefined();
      expect(getNestedValue(testObject, 'address.nonexistent')).toBeUndefined();
      expect(getNestedValue(testObject, 'address.geo.altitude')).toBeUndefined();
    });

    it('should handle null and undefined objects', () => {
      expect(getNestedValue(null, 'name')).toBeUndefined();
      expect(getNestedValue(undefined, 'name')).toBeUndefined();
    });

    it('should handle empty path', () => {
      expect(getNestedValue(testObject, '')).toBeUndefined();
    });
  });

  describe('debounce', () => {
    jest.useFakeTimers();

    afterEach(() => {
      jest.clearAllTimers();
    });

    it('should delay function execution', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('arg1', 'arg2');
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should cancel previous execution if called again', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      jest.advanceTimersByTime(50);
      
      debouncedFn('second');
      jest.advanceTimersByTime(50);
      
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledWith('second');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should execute with correct arguments', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 50);

      debouncedFn(1, 2, 3);
      jest.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledWith(1, 2, 3);
    });

    it('should work with different delay times', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn();
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalled();
    });
  });
});
