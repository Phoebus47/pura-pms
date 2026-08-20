import { apiClient, getAuthToken } from './client';

export type LostFoundStatus = 'FOUND' | 'CLAIMED' | 'RETURNED' | 'DISPOSED';

export interface LostFoundItem {
  id: string;
  propertyId: string;
  itemDescription: string;
  locationFound: string;
  roomNumber: string | null;
  foundBy: string;
  foundAt: string;
  notes: string | null;
  guestId: string | null;
  status: LostFoundStatus;
  claimedAt: string | null;
  claimedBy: string | null;
  returnedAt: string | null;
  returnedTo: string | null;
  disposedAt: string | null;
  disposedBy: string | null;
  disposeReason: string | null;
  retentionDays: number;
  createdAt: string;
  updatedAt: string;
  guest?: { id: string; firstName: string; lastName: string } | null;
}

export interface CreateLostFoundItemDto {
  propertyId: string;
  itemDescription: string;
  locationFound: string;
  foundBy: string;
  foundAt?: string;
  roomNumber?: string;
  notes?: string;
  guestId?: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const lostFoundAPI = {
  async list(params: {
    propertyId: string;
    status?: LostFoundStatus;
    overdue?: boolean;
  }): Promise<LostFoundItem[]> {
    const query = new URLSearchParams({ propertyId: params.propertyId });
    if (params.status) query.set('status', params.status);
    if (params.overdue) query.set('overdue', 'true');
    return apiClient.get<LostFoundItem[]>(
      `/lost-found?${query.toString()}`,
      authToken(),
    );
  },

  async create(data: CreateLostFoundItemDto): Promise<LostFoundItem> {
    return apiClient.post<LostFoundItem>('/lost-found', data, authToken());
  },

  async claim(
    id: string,
    claimedBy: string,
    guestId?: string,
  ): Promise<LostFoundItem> {
    return apiClient.post<LostFoundItem>(
      `/lost-found/${id}/claim`,
      { claimedBy, guestId },
      authToken(),
    );
  },

  async returnItem(id: string, returnedTo: string): Promise<LostFoundItem> {
    return apiClient.post<LostFoundItem>(
      `/lost-found/${id}/return`,
      { returnedTo },
      authToken(),
    );
  },

  async dispose(
    id: string,
    disposedBy: string,
    disposeReason: string,
  ): Promise<LostFoundItem> {
    return apiClient.post<LostFoundItem>(
      `/lost-found/${id}/dispose`,
      { disposedBy, disposeReason },
      authToken(),
    );
  },
};
