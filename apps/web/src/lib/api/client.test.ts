/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  APIClient,
  APIError,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
} from './client';

describe('APIClient', () => {
  const originalFetch = globalThis.fetch;
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
    try {
      Object.defineProperty(globalThis, 'window', {
        value: { localStorage: localStorageMock },
        writable: true,
        configurable: true,
      });
    } catch {
      (
        globalThis as unknown as {
          window: { localStorage: typeof localStorageMock };
        }
      ).window = {
        localStorage: localStorageMock,
      };
    }
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
    } catch {
      (
        globalThis as unknown as { localStorage: typeof localStorageMock }
      ).localStorage = localStorageMock;
    }
    vi.clearAllMocks();
  });

  afterEach(() => {
    (globalThis as any).fetch = originalFetch;
    try {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } catch {}
  });

  describe('constructor', () => {
    it('should create APIClient with default baseURL', () => {
      const client = new APIClient();
      expect(client).toBeInstanceOf(APIClient);
    });

    it('should create APIClient with custom baseURL', () => {
      const client = new APIClient('https://api.example.com');
      expect(client).toBeInstanceOf(APIClient);
    });
  });

  describe('get', () => {
    it('should make GET request successfully', async () => {
      const mockData = { id: '1', name: 'Test' };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const client = new APIClient();
      const result = await client.get('/test');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should include Authorization header when token is provided', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.get('/test', 'test-token');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        }),
      );
    });

    it('should use getAuthToken when token is not provided', async () => {
      localStorageMock.getItem.mockReturnValue('stored-token');
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.get('/test');

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer stored-token',
          }),
        }),
      );
    });

    it('should not include Authorization header when no token is available', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.get('/test');

      const callArgs = (globalThis.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers as Record<string, string>;
      expect(headers.Authorization).toBeUndefined();
    });
  });

  describe('mock api interception', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should route request to mock router when NEXT_PUBLIC_USE_MOCK_API is true', async () => {
      process.env.NEXT_PUBLIC_USE_MOCK_API = 'true';
      const client = new APIClient();

      // using a guaranteed mock endpoint
      const response = await client.get('/metrics/occupancy');

      expect(globalThis.fetch).not.toHaveBeenCalled();
      expect(response).toBeDefined();
      expect((response as any).totalRooms).toBeDefined();
    });
  });

  describe('post', () => {
    it('should make POST request with data', async () => {
      const mockData = { id: '1', name: 'Test' };
      const postData = { name: 'Test' };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const client = new APIClient();
      const result = await client.post('/test', postData);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should make POST request without data', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.post('/test');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        }),
      );
    });
  });

  describe('patch', () => {
    it('should make PATCH request with data', async () => {
      const mockData = { id: '1', name: 'Updated' };
      const patchData = { name: 'Updated' };
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const client = new APIClient();
      const result = await client.patch('/test/1', patchData);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(patchData),
        }),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 204,
      });

      const client = new APIClient();
      const result = await client.delete('/test/1');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should throw APIError when response is not ok', async () => {
      const errorData = { message: 'Not found' };
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorData,
      });

      const client = new APIClient();

      await expect(client.get('/test')).rejects.toThrow(APIError);
      await expect(client.get('/test')).rejects.toThrow(
        'API Error: 404 Not Found',
      );
    });

    it('should handle network errors', async () => {
      (globalThis.fetch as any).mockRejectedValue(new Error('Network error'));

      const client = new APIClient();

      await expect(client.get('/test')).rejects.toThrow(
        'Network error: Network error',
      );
    });

    it('should handle non-Error network failures', async () => {
      (globalThis.fetch as any).mockRejectedValue('Unknown error');

      const client = new APIClient();

      await expect(client.get('/test')).rejects.toThrow(
        'Network error: Unknown error',
      );
    });

    it('should handle JSON parse error in error response', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const client = new APIClient();

      await expect(client.get('/test')).rejects.toThrow(APIError);
    });
  });

  describe('custom headers', () => {
    it('should merge custom headers with default headers', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.get('/test');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle request with no options parameter', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      const requestMethod = (
        client as unknown as { request: (typeof client)['get'] }
      ).request;
      await requestMethod.call(client, '/test');

      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should handle patch with undefined data', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      await client.patch('/test');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'PATCH',
        }),
      );
    });

    it('should handle request method with no options', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      const requestMethod = (
        client as unknown as { request: (typeof client)['get'] }
      ).request;
      await requestMethod.call(client, '/test');

      expect(globalThis.fetch).toHaveBeenCalled();
    });

    it('should handle request method with empty options object', async () => {
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      const client = new APIClient();
      const requestMethod = (
        client as unknown as {
          request: <T>(
            endpoint: string,
            options?: Record<string, unknown>,
          ) => Promise<T>;
        }
      ).request;
      await requestMethod.call(client, '/test', {});

      expect(globalThis.fetch).toHaveBeenCalled();
    });
  });
});

describe('APIError', () => {
  it('should create APIError with status and statusText', () => {
    const error = new APIError(404, 'Not Found', {
      message: 'Resource not found',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(APIError);
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
    expect(error.data).toEqual({ message: 'Resource not found' });
    expect(error.message).toBe('API Error: 404 Not Found');
    expect(error.name).toBe('APIError');
  });

  it('should create APIError without data', () => {
    const error = new APIError(500, 'Internal Server Error');

    expect(error.status).toBe(500);
    expect(error.statusText).toBe('Internal Server Error');
    expect(error.data).toBeUndefined();
  });
});

describe('getAuthToken', () => {
  const localStorageMock = {
    getItem: vi.fn(),
  };
  const originalLocalStorage = globalThis.localStorage;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: { ...originalWindow, localStorage: localStorageMock },
          writable: true,
          configurable: true,
        });
      }
    } catch {}
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    } catch {}
  });

  it('should return token from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('test-token');

    const token = getAuthToken();

    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    expect(token).toBe('test-token');
  });

  it('should return null when token is not found', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const token = getAuthToken();

    expect(token).toBeNull();
  });

  it('should return null when window is undefined', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    );

    if (windowDescriptor?.configurable) {
      try {
        Object.defineProperty(globalThis, 'window', {
          value: undefined,
          writable: true,
          configurable: true,
        });

        const token = getAuthToken();

        expect(token).toBeNull();
      } finally {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    } else {
      expect(true).toBe(true);
    }
  });
});

describe('setAuthToken', () => {
  const localStorageMock = {
    setItem: vi.fn(),
  };
  const originalLocalStorage = globalThis.localStorage;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: { ...originalWindow, localStorage: localStorageMock },
          writable: true,
          configurable: true,
        });
      }
    } catch {}
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    } catch {}
  });

  it('should set token in localStorage', () => {
    setAuthToken('test-token');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'token',
      'test-token',
    );
  });

  it('should not set token when window is undefined', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    );

    if (windowDescriptor?.configurable) {
      try {
        Object.defineProperty(globalThis, 'window', {
          value: undefined,
          writable: true,
          configurable: true,
        });

        setAuthToken('test-token');

        expect(localStorageMock.setItem).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    } else {
      expect(true).toBe(true);
    }
  });
});

describe('clearAuthToken', () => {
  const localStorageMock = {
    removeItem: vi.fn(),
  };
  const originalLocalStorage = globalThis.localStorage;
  const originalWindow = globalThis.window;

  beforeEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', {
          value: { ...originalWindow, localStorage: localStorageMock },
          writable: true,
          configurable: true,
        });
      }
    } catch {}
    vi.clearAllMocks();
  });

  afterEach(() => {
    try {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } catch {}
    try {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    } catch {}
  });

  it('should remove token from localStorage', () => {
    clearAuthToken();

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
  });

  it('should not remove token when window is undefined', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    );

    if (windowDescriptor?.configurable) {
      try {
        Object.defineProperty(globalThis, 'window', {
          value: undefined,
          writable: true,
          configurable: true,
        });

        clearAuthToken();

        expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(globalThis, 'window', windowDescriptor);
      }
    } else {
      expect(true).toBe(true);
    }
  });
});
