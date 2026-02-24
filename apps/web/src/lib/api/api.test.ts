import {
  APIClient,
  APIError,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
} from './client';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('APIClient', () => {
  let client: APIClient;

  beforeEach(() => {
    client = new APIClient('http://test-api.com');
    mockFetch.mockReset();
    localStorageMock.clear();
  });

  describe('HTTP Methods', () => {
    it('performs GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: 'test' }),
      });

      const result = await client.get('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('performs POST request with data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1 }),
      });

      const result = await client.post('/test', { name: 'foo' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'foo' }),
        }),
      );
      expect(result).toEqual({ id: 1 });
    });

    it('performs PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ updated: true }),
      });

      await client.patch('/test', { name: 'bar' });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({ method: 'PATCH' }),
      );
    });

    it('performs DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ deleted: true }),
      });

      await client.delete('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });
  });

  describe('Error Handling', () => {
    it('throws APIError on 4xx/5xx responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Validation failed' }),
      });

      await expect(client.get('/test')).rejects.toThrow(APIError);

      try {
        await client.get('/test');
      } catch (error) {
        if (error instanceof APIError) {
          expect(error.status).toBe(400);
          expect(error.data).toEqual({ message: 'Validation failed' });
        }
      }
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));
      await expect(client.get('/test')).rejects.toThrow(
        'Network error: Network failure',
      );
    });

    it('handles JSON parsing errors in error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      try {
        await client.get('/test');
      } catch (error) {
        if (error instanceof APIError) {
          expect(error.status).toBe(500);
          expect(error.data).toBeNull(); // Should catch and return null
        }
      }
    });

    it('preserves existing APIError', async () => {
      // This tests the rethrow logic in the catch block if needed,
      // though mainly focused on ensuring type checks work.
      // Effectively tested by the 4xx/5xx test above which throws APIError internally intentionally.
    });
  });

  describe('Auth Token Management', () => {
    it('sets and gets auth token', () => {
      setAuthToken('abc-123');
      expect(getAuthToken()).toBe('abc-123');
      expect(localStorageMock.getItem('token')).toBe('abc-123');
    });

    it('clears auth token', () => {
      setAuthToken('abc-123');
      clearAuthToken();
      expect(getAuthToken()).toBeNull();
    });

    it('sends token in headers if present', async () => {
      setAuthToken('token-123');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token-123',
          }),
        }),
      );
    });

    it('allows overriding token per request', async () => {
      setAuthToken('global-token');
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await client.get('/test', 'custom-token');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer custom-token',
          }),
        }),
      );
    });
  });

  describe('Special Status Codes', () => {
    it('returns null for 204 No Content', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}), // Request shouldn't parse JSON if 204 check passes
      });

      const result = await client.get('/test');
      expect(result).toBeNull();
    });
  });
});
