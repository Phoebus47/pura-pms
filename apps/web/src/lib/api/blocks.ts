import { apiClient, getAuthToken } from './client';

export type BlockKind = 'ALLOTMENT' | 'GROUP';
export type BlockInventoryMode = 'GENERAL' | 'DEDICATED';
export type BlockStatus = 'OPEN' | 'RELEASED' | 'CLOSED';

export interface RoomBlock {
  id: string;
  propertyId: string;
  roomTypeId: string;
  code: string;
  name: string;
  kind: BlockKind;
  inventoryMode: BlockInventoryMode;
  channel?: string | null;
  startDate: string;
  endDate: string;
  cutoffDate: string;
  allottedRooms: number;
  releasedRooms: number;
  status: BlockStatus;
  notes?: string | null;
  roomType?: { id: string; name: string; code: string };
  _count?: { reservations: number };
}

export interface CreateBlockDto {
  propertyId: string;
  roomTypeId: string;
  code: string;
  name: string;
  kind: BlockKind;
  inventoryMode?: BlockInventoryMode;
  channel?: string;
  startDate: string;
  endDate: string;
  cutoffDate: string;
  allottedRooms: number;
  notes?: string;
}

export interface PickupNight {
  stayDate: string;
  allotted: number;
  pickedUp: number;
  remaining: number;
}

export interface PickupReport {
  blockId: string;
  allottedRooms: number;
  releasedRooms: number;
  pickedUp: number;
  remaining: number;
  nights: PickupNight[];
}

function authToken() {
  return getAuthToken() || undefined;
}

export const blocksAPI = {
  async getAll(propertyId?: string): Promise<RoomBlock[]> {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return apiClient.get<RoomBlock[]>(`/blocks${query}`, authToken());
  },

  async create(data: CreateBlockDto): Promise<RoomBlock> {
    return apiClient.post<RoomBlock>('/blocks', data, authToken());
  },

  async getPickup(id: string): Promise<PickupReport> {
    return apiClient.get<PickupReport>(`/blocks/${id}/pickup`, authToken());
  },

  async attach(id: string, reservationId: string): Promise<PickupReport> {
    return apiClient.post<PickupReport>(
      `/blocks/${id}/reservations`,
      { reservationId },
      authToken(),
    );
  },

  async release(id: string): Promise<RoomBlock> {
    return apiClient.post<RoomBlock>(`/blocks/${id}/release`, {}, authToken());
  },
};
