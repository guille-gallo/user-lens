// Validation Constants
// =====================
// Form validation messages and patterns

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  MIN_LENGTH: 'Minimum length is {min} characters',
  MAX_LENGTH: 'Maximum length is {max} characters',
  INVALID_ZIP: 'Please enter a valid zip code',
  INVALID_NAME: 'Name must contain only letters and spaces'
} as const;

/**
 * Regular expression patterns for validation
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9]?[\d\s\-\(\)\.]{10,}$/,
  URL: /^https?:\/\/.+\..+$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  NAME: /^[a-zA-Z\s]+$/
} as const;

/**
 * Field length constraints
 */
export const FIELD_LIMITS = {
  NAME: { MIN: 2, MAX: 50 },
  USERNAME: { MIN: 3, MAX: 30 },
  EMAIL: { MIN: 5, MAX: 100 },
  PHONE: { MIN: 10, MAX: 20 },
  COMPANY_NAME: { MIN: 2, MAX: 100 },
  ADDRESS: { MIN: 5, MAX: 100 },
  CITY: { MIN: 2, MAX: 50 },
  ZIP_CODE: { MIN: 5, MAX: 10 }
} as const;
