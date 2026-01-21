import { apiClient, getAuthToken } from "./client";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
  vipLevel: number;
  isBlacklist: boolean;
  notes?: string;
  preferences?: Record<string, unknown>;
  totalStays: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    reservations: number;
  };
}

export interface CreateGuestDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  nationality?: string;
  dateOfBirth?: string;
  address?: string;
  vipLevel?: number;
  isBlacklist?: boolean;
  notes?: string;
  preferences?: Record<string, unknown>;
}

export type UpdateGuestDto = Partial<CreateGuestDto>;

export interface GuestSearchParams {
  search?: string;
  isBlacklist?: boolean;
  vipLevel?: number;
  limit?: number;
  offset?: number;
}

export interface GuestListResponse {
  data: Guest[];
  total: number;
  limit?: number;
  offset?: number;
}

export const guestsAPI = {
  async getAll(params?: GuestSearchParams): Promise<GuestListResponse> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.isBlacklist !== undefined)
      queryParams.append("isBlacklist", String(params.isBlacklist));
    if (params?.vipLevel !== undefined)
      queryParams.append("vipLevel", String(params.vipLevel));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const query = queryParams.toString();
    const endpoint = query ? `/guests?${query}` : "/guests";
    return apiClient.get<GuestListResponse>(endpoint, token || undefined);
  },

  async getById(id: string): Promise<Guest> {
    const token = getAuthToken();
    return apiClient.get<Guest>(`/guests/${id}`, token || undefined);
  },

  async getHistory(id: string): Promise<unknown> {
    const token = getAuthToken();
    return apiClient.get<unknown>(`/guests/${id}/history`, token || undefined);
  },

  async create(data: CreateGuestDto): Promise<Guest> {
    const token = getAuthToken();
    return apiClient.post<Guest>("/guests", data, token || undefined);
  },

  async update(id: string, data: UpdateGuestDto): Promise<Guest> {
    const token = getAuthToken();
    return apiClient.patch<Guest>(`/guests/${id}`, data, token || undefined);
  },

  async updateVipLevel(id: string, vipLevel: number): Promise<Guest> {
    const token = getAuthToken();
    return apiClient.patch<Guest>(
      `/guests/${id}/vip`,
      { vipLevel },
      token || undefined,
    );
  },

  async toggleBlacklist(id: string): Promise<Guest> {
    const token = getAuthToken();
    return apiClient.patch<Guest>(
      `/guests/${id}/blacklist`,
      {},
      token || undefined,
    );
  },

  async delete(id: string): Promise<void> {
    const token = getAuthToken();
    return apiClient.delete<void>(`/guests/${id}`, token || undefined);
  },
};
