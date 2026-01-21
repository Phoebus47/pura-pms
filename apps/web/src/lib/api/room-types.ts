import { apiClient, getAuthToken } from "./client";

export interface RoomType {
  id: string;
  name: string;
  code: string;
  description?: string;
  baseRate: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  propertyId: string;
  property?: {
    id: string;
    name: string;
  };
  _count?: {
    rooms: number;
    rates: number;
  };
}

export interface CreateRoomTypeDto {
  name: string;
  code: string;
  description?: string;
  baseRate: number;
  maxAdults?: number;
  maxChildren?: number;
  amenities?: string[];
  propertyId: string;
}

export interface UpdateRoomTypeDto extends Partial<CreateRoomTypeDto> {}

export const roomTypesAPI = {
  async getAll(propertyId?: string): Promise<RoomType[]> {
    const token = getAuthToken();
    const endpoint = propertyId
      ? `/room-types?propertyId=${propertyId}`
      : "/room-types";
    return apiClient.get<RoomType[]>(endpoint, token || undefined);
  },

  async getById(id: string): Promise<RoomType> {
    const token = getAuthToken();
    return apiClient.get<RoomType>(`/room-types/${id}`, token || undefined);
  },

  async create(data: CreateRoomTypeDto): Promise<RoomType> {
    const token = getAuthToken();
    return apiClient.post<RoomType>("/room-types", data, token || undefined);
  },

  async update(id: string, data: UpdateRoomTypeDto): Promise<RoomType> {
    const token = getAuthToken();
    return apiClient.patch<RoomType>(
      `/room-types/${id}`,
      data,
      token || undefined,
    );
  },

  async delete(id: string): Promise<void> {
    const token = getAuthToken();
    return apiClient.delete<void>(`/room-types/${id}`, token || undefined);
  },
};
