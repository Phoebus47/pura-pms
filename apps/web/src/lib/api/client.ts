// Base API client for PURA PMS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface RequestOptions extends RequestInit {
  token?: string;
}

class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

export class APIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(fetchOptions.headers as Record<string, string>),
    };

    // Add authorization header if token is provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new APIError(response.status, response.statusText, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      // Network or other errors
      throw new Error(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const authToken = token || getAuthToken();
    return this.request<T>(endpoint, {
      method: "GET",
      token: authToken || undefined,
    });
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const authToken = token || getAuthToken();
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      token: authToken || undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const authToken = token || getAuthToken();
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      token: authToken || undefined,
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const authToken = token || getAuthToken();
    return this.request<T>(endpoint, {
      method: "DELETE",
      token: authToken || undefined,
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Helper to get token from localStorage (client-side only)
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Helper to set token
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

// Helper to clear token
export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
}
