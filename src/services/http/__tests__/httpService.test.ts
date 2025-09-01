import { fetchWithTimeout, HttpError, TimeoutError } from '../httpService';

// Mock fetch for testing
global.fetch = jest.fn();

// Mock Response constructor for tests
const MockResponse = class {
  body: string;
  init: ResponseInit;
  
  constructor(body: string, init: ResponseInit = {}) {
    this.body = body;
    this.init = init;
  }
  
  json() {
    return Promise.resolve(JSON.parse(this.body));
  }
  
  get status() {
    return this.init.status || 200;
  }
  
  get ok() {
    return this.status >= 200 && this.status < 300;
  }
  
  get statusText() {
    return this.init.statusText || 'OK';
  }
} as any;

describe('HTTP Service Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('fetchWithTimeout', () => {
    it('should resolve when fetch completes within timeout', async () => {
      const mockResponse = new MockResponse('{"data": "test"}', { status: 200 });
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchWithTimeout('https://example.com');
      
      expect(result).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('https://example.com', {});
    });

    it('should reject with TimeoutError when timeout exceeds', async () => {
      jest.useFakeTimers();
      
      // Make fetch hang
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(() => {}) // Never resolves
      );

      const timeoutPromise = fetchWithTimeout('https://example.com');
      
      // Advance timers to trigger timeout
      jest.advanceTimersByTime(9000);
      
      await expect(timeoutPromise).rejects.toThrow(TimeoutError);
      
      jest.useRealTimers();
    });

    it('should use default timeout when not specified', async () => {
      const mockResponse = new MockResponse('test');
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await fetchWithTimeout('https://example.com');
      
      expect(fetch).toHaveBeenCalled();
    });

    it('should pass through fetch errors', async () => {
      const fetchError = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValue(fetchError);

      await expect(fetchWithTimeout('https://example.com'))
        .rejects
        .toThrow('Network error');
    });

    it('should handle custom request options', async () => {
      const mockResponse = new MockResponse('test');
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
      await fetchWithTimeout('https://example.com', options);
      
      expect(fetch).toHaveBeenCalledWith('https://example.com', options);
    });
  });

  describe('HttpError', () => {
    it('should create error with all properties', () => {
      const error = new HttpError('Test error', 404, 'Not Found', '/api/test');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.endpoint).toBe('/api/test');
      expect(error.name).toBe('HttpError');
    });

    it('should be instance of Error', () => {
      const error = new HttpError('Test', 500, 'Error', '/api');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpError);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error with message', () => {
      const error = new TimeoutError('Request timeout after 5000ms');
      
      expect(error.message).toBe('Request timeout after 5000ms');
      expect(error.name).toBe('TimeoutError');
    });

    it('should be instance of Error', () => {
      const error = new TimeoutError('Timeout');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TimeoutError);
    });
  });
});
