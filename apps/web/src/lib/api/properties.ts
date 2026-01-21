import { apiClient, getAuthToken } from "./client";

export interface Property {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  currency: string;
  timezone: string;
  createdAt: string;
  _count?: {
    rooms: number;
    roomTypes: number;
  };
}

export interface CreatePropertyDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  currency?: string;
  timezone?: string;
}

export type UpdatePropertyDto = Partial<CreatePropertyDto>;

export const propertiesAPI = {
  async getAll(): Promise<Property[]> {
    const token = getAuthToken();
    return apiClient.get<Property[]>("/properties", token || undefined);
  },

  async getById(id: string): Promise<Property> {
    const token = getAuthToken();
    return apiClient.get<Property>(`/properties/${id}`, token || undefined);
  },

  async create(data: CreatePropertyDto): Promise<Property> {
    const token = getAuthToken();
    return apiClient.post<Property>("/properties", data, token || undefined);
  },

  async update(id: string, data: UpdatePropertyDto): Promise<Property> {
    const token = getAuthToken();
    return apiClient.patch<Property>(
      `/properties/${id}`,
      data,
      token || undefined,
    );
  },

  async delete(id: string): Promise<void> {
    const token = getAuthToken();
    return apiClient.delete<void>(`/properties/${id}`, token || undefined);
  },
};
