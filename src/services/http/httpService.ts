/**
 * Enhanced HTTP Service with SOLID principles and performance optimizations
 * - Single Responsibility: Only handles HTTP operations
 * - Open/Closed: Extensible through inheritance
 * - Liskov Substitution: Any service can extend this
 * - Interface Segregation: Clean HTTP interface
 * - Dependency Inversion: Depends on abstractions
 */

import { API_CONFIG, HTTP_METHODS, CONTENT_TYPES } from '../../constants/api';

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Custom error types for better error handling
 */
export class HttpError extends Error {
  public status: number;
  public statusText: string;
  public endpoint: string;

  constructor(
    message: string,
    status: number,
    statusText: string,
    endpoint: string
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.endpoint = endpoint;
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Fetch with timeout functionality and better error handling
 */
export const fetchWithTimeout = (
  url: string, 
  options: RequestOptions = {}, 
  timeout = API_CONFIG.TIMEOUT
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(`Request timeout after ${timeout}ms`)), timeout)
    )
  ]);
};

/**
 * Enhanced HTTP client with error handling and performance optimizations
 */
export class BaseHttpService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': CONTENT_TYPES.JSON,
    };
  }

  /**
   * Centralized error handling
   */
  private handleError(error: unknown, endpoint: string, method: string): never {
    if (error instanceof TimeoutError) {
      throw error;
    }
    
    if (error instanceof Response) {
      throw new HttpError(
        `${method} ${endpoint} failed: ${error.statusText}`,
        error.status,
        error.statusText,
        endpoint
      );
    }
    
    throw new Error(`${method} ${endpoint} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  /**
   * Enhanced GET request with error handling and cancellation support
   */
  protected async get<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, { signal });
      if (!response.ok) {
        this.handleError(response, endpoint, 'GET');
      }
      return response.json();
    } catch (error) {
      this.handleError(error, endpoint, 'GET');
    }
  }

  /**
   * Enhanced POST request with error handling and cancellation support
   */
  protected async post<T>(endpoint: string, data: unknown, signal?: AbortSignal): Promise<T> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: HTTP_METHODS.POST,
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
        signal,
      });
      if (!response.ok) {
        this.handleError(response, endpoint, 'POST');
      }
      return response.json();
    } catch (error) {
      this.handleError(error, endpoint, 'POST');
    }
  }

  /**
   * Enhanced PUT request with error handling and cancellation support
   */
  protected async put<T>(endpoint: string, data: unknown, signal?: AbortSignal): Promise<T> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: HTTP_METHODS.PUT,
        headers: this.defaultHeaders,
        body: JSON.stringify(data),
        signal,
      });
      if (!response.ok) {
        this.handleError(response, endpoint, 'PUT');
      }
      return response.json();
    } catch (error) {
      this.handleError(error, endpoint, 'PUT');
    }
  }

  /**
   * Enhanced DELETE request with error handling and cancellation support
   */
  protected async delete(endpoint: string, signal?: AbortSignal): Promise<void> {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method: HTTP_METHODS.DELETE,
        signal,
      });
      if (!response.ok) {
        this.handleError(response, endpoint, 'DELETE');
      }
    } catch (error) {
      this.handleError(error, endpoint, 'DELETE');
    }
  }
}
