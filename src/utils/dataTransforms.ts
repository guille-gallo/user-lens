/**
 * Utility functions for data transformations
 * Pure functions for business logic operations
 * Follows DRY principles - centralized utilities to avoid duplication
 */

/**
 * Format field names for display (e.g., "address.city" -> "Address City")
 * Used by UserDetailPage for field labels
 */
export const formatFieldName = (field: string): string => {
  return field
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Get nested object value by string path
 * Centralized implementation to replace duplicated code in stores
 */
export const getNestedValue = (obj: unknown, path: string): unknown => {
  const keys = path.split('.');
  let value: unknown = obj;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return value;
};

/**
 * Debounce function for performance optimization
 * Centralized implementation to replace inline implementations
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Normalize user data to ensure coordinates are strings
 * Handles the conversion of numeric lat/lng values from the API to strings
 */
export const normalizeUser = <T extends { address?: { geo?: { lat?: unknown; lng?: unknown } } }>(user: T): T => {
  if (!user.address?.geo) {
    return user;
  }

  return {
    ...user,
    address: {
      ...user.address,
      geo: {
        ...user.address.geo,
        lat: String(user.address.geo.lat || ''),
        lng: String(user.address.geo.lng || '')
      }
    }
  };
};

/**
 * Normalize an array of users
 */
export const normalizeUsers = <T extends { address?: { geo?: { lat?: unknown; lng?: unknown } } }>(users: T[]): T[] => {
  return users.map(normalizeUser);
};
