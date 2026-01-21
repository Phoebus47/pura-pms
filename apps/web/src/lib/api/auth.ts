import { apiClient, getAuthToken } from "./client";

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const authAPI = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  async getCurrentUser(token: string): Promise<AuthResponse["user"]> {
    return apiClient.get<AuthResponse["user"]>("/auth/me", token);
  },
};
