import { apiClient, getAuthToken } from './client';

export type MessageDirection = 'INBOUND' | 'OUTBOUND';
export type MessageChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'WHATSAPP';

export interface GuestMessage {
  id: string;
  propertyId: string;
  guestId: string;
  reservationId: string | null;
  direction: MessageDirection;
  channel: MessageChannel;
  content: string;
  sentBy: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  guest?: { id: string; firstName: string; lastName: string } | null;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
  } | null;
}

export interface CreateGuestMessageDto {
  propertyId: string;
  guestId: string;
  reservationId?: string;
  direction: MessageDirection;
  content: string;
  sentBy?: string;
  channel?: 'IN_APP';
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const guestMessagesAPI = {
  async list(params: {
    propertyId: string;
    guestId?: string;
    reservationId?: string;
    unread?: boolean;
  }): Promise<GuestMessage[]> {
    const query = new URLSearchParams({ propertyId: params.propertyId });
    if (params.guestId) query.set('guestId', params.guestId);
    if (params.reservationId) query.set('reservationId', params.reservationId);
    if (params.unread) query.set('unread', 'true');
    return apiClient.get<GuestMessage[]>(
      `/guest-messages?${query.toString()}`,
      authToken(),
    );
  },

  async create(data: CreateGuestMessageDto): Promise<GuestMessage> {
    return apiClient.post<GuestMessage>('/guest-messages', data, authToken());
  },

  async markRead(id: string): Promise<GuestMessage> {
    return apiClient.post<GuestMessage>(
      `/guest-messages/${id}/read`,
      {},
      authToken(),
    );
  },
};
