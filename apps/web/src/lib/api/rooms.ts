import { apiClient, getAuthToken } from './client';

export type RoomStatus =
  | 'VACANT_CLEAN'
  | 'VACANT_DIRTY'
  | 'OCCUPIED_CLEAN'
  | 'OCCUPIED_DIRTY'
  | 'OUT_OF_ORDER'
  | 'OUT_OF_SERVICE';

export interface Room {
  id: string;
  number: string;
  floor?: number;
  status: RoomStatus;
  notes?: string;
  roomTypeId: string;
  propertyId: string;
  roomType?: {
    id: string;
    name: string;
    code: string;
    description?: string;
    baseRate: number;
    maxOccupancy?: number;
    amenities?: string[];
  };
  property?: {
    id: string;
    name: string;
  };
  _count?: {
    reservations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  number: string;
  floor?: number;
  status?: RoomStatus;
  roomTypeId: string;
  propertyId: string;
}

export type UpdateRoomDto = Partial<CreateRoomDto>;

export interface RoomFilterParams {
  propertyId?: string;
  roomTypeId?: string;
  status?: RoomStatus;
}

export interface AvailabilityParams {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  roomTypeId?: string;
}

export const roomsAPI = {
  async getAll(filters?: RoomFilterParams): Promise<Room[]> {
    const token = getAuthToken();
    const params = new URLSearchParams();
    if (filters?.propertyId) params.append('propertyId', filters.propertyId);
    if (filters?.roomTypeId) params.append('roomTypeId', filters.roomTypeId);
    if (filters?.status) params.append('status', filters.status);

    const query = params.toString();
    const endpoint = query ? `/rooms?${query}` : '/rooms';
    return apiClient.get<Room[]>(endpoint, token || undefined);
  },

  async getById(id: string): Promise<Room> {
    const token = getAuthToken();
    return apiClient.get<Room>(`/rooms/${id}`, token || undefined);
  },

  async create(data: CreateRoomDto): Promise<Room> {
    const token = getAuthToken();
    return apiClient.post<Room>('/rooms', data, token || undefined);
  },

  async update(id: string, data: UpdateRoomDto): Promise<Room> {
    const token = getAuthToken();
    return apiClient.patch<Room>(`/rooms/${id}`, data, token || undefined);
  },

  async updateStatus(id: string, status: RoomStatus): Promise<Room> {
    const token = getAuthToken();
    return apiClient.patch<Room>(
      `/rooms/${id}/status`,
      { status },
      token || undefined,
    );
  },

  async delete(id: string): Promise<void> {
    const token = getAuthToken();
    return apiClient.delete<void>(`/rooms/${id}`, token || undefined);
  },

  async checkAvailability(params: AvailabilityParams): Promise<unknown> {
    const token = getAuthToken();
    const queryParams = new URLSearchParams({
      propertyId: params.propertyId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
    });
    if (params.roomTypeId) queryParams.append('roomTypeId', params.roomTypeId);

    return apiClient.get<unknown>(
      `/rooms/availability?${queryParams.toString()}`,
      token || undefined,
    );
  },
};
