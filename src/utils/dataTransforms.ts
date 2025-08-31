/**
 * Utility functions for data transformations
 * Pure functions for business logic operations
 */

/**
 * Format field names for display (e.g., "address.city" -> "Address City")
 */
export const formatFieldName = (field: string): string => {
  return field
    .split('.')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Get nested object value by string path
 */
export const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Set nested object value by string path
 */
export const setNestedValue = (
  obj: Record<string, any>, 
  path: string, 
  value: any
): Record<string, any> => {
  const keys = path.split('.');
  const result = { ...obj };
  
  let current = result;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = { ...current[key] };
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  return result;
};

/**
 * Sort array by nested field path
 */
export const sortByNestedField = <T>(
  array: T[], 
  fieldPath: string, 
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = getNestedValue(a as any, fieldPath);
    const bValue = getNestedValue(b as any, fieldPath);
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return order === 'asc' ? 1 : -1;
    if (bValue == null) return order === 'asc' ? -1 : 1;
    
    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Filter array by search term across multiple fields
 */
export const filterBySearchTerm = <T>(
  array: T[],
  searchTerm: string,
  searchFields: string[]
): T[] => {
  if (!searchTerm.trim()) return array;
  
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  return array.filter(item => 
    searchFields.some(field => {
      const value = getNestedValue(item as any, field);
      return value?.toString().toLowerCase().includes(normalizedSearch);
    })
  );
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
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
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)\.]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Generate unique ID (simple implementation)
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
