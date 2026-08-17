import { apiClient, getAuthToken } from './client';

export interface PartnerHotel {
  id: string;
  propertyId: string;
  name: string;
  address?: string;
  phone?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerHotelDto {
  propertyId: string;
  name: string;
  address?: string;
  phone?: string;
  contactPerson?: string;
  isActive?: boolean;
}

export type UpdatePartnerHotelDto = Partial<CreatePartnerHotelDto>;

export const partnerHotelsAPI = {
  async getAll(propertyId?: string): Promise<PartnerHotel[]> {
    const token = getAuthToken();
    const endpoint = propertyId
      ? `/partner-hotels?propertyId=${propertyId}`
      : '/partner-hotels';
    return apiClient.get<PartnerHotel[]>(endpoint, token || undefined);
  },

  async getById(id: string): Promise<PartnerHotel> {
    const token = getAuthToken();
    return apiClient.get<PartnerHotel>(
      `/partner-hotels/${id}`,
      token || undefined,
    );
  },

  async create(data: CreatePartnerHotelDto): Promise<PartnerHotel> {
    const token = getAuthToken();
    return apiClient.post<PartnerHotel>(
      '/partner-hotels',
      data,
      token || undefined,
    );
  },

  async update(id: string, data: UpdatePartnerHotelDto): Promise<PartnerHotel> {
    const token = getAuthToken();
    return apiClient.patch<PartnerHotel>(
      `/partner-hotels/${id}`,
      data,
      token || undefined,
    );
  },
};
