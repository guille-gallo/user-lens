// API Constants
// ==============
// HTTP status codes, endpoints, and API-related constants

/**
 * API base URLs and configuration
 */
export const API_CONFIG = {
  JSONPLACEHOLDER: 'https://jsonplaceholder.typicode.com',
  LOCAL_API: 'http://localhost:3001',
  VERCEL_API: 'https://user-lens-4yvhlzqlx-guillermos-projects-cc2deb38.vercel.app/api',
  TIMEOUT: 8000, // 8 seconds
} as const;

/**
 * API endpoints
 */
export const ENDPOINTS = {
  USERS: '/users',
  NOTIFICATIONS: '/notifications',
  METRICS: '/metrics',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * HTTP methods
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
} as const;

/**
 * Content types
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded'
} as const;

/**
 * Error messages for API failures
 */
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
} as const;
