import { apiClient, getAuthToken } from './client';

export type WakeUpCallStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED';

export interface WakeUpCall {
  id: string;
  propertyId: string;
  reservationId: string;
  roomId: string;
  scheduledAt: string;
  scheduledDate: string;
  status: WakeUpCallStatus;
  notes: string | null;
  scheduledBy: string;
  completedAt: string | null;
  completedBy: string | null;
  missedAt: string | null;
  missedBy: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
    guest: { firstName: string; lastName: string };
  };
  room?: { id: string; number: string };
  property?: { id: string; name: string };
}

export interface CreateWakeUpCallDto {
  reservationId: string;
  scheduledAt: string;
  scheduledBy: string;
  notes?: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const wakeUpCallsAPI = {
  async list(params: {
    propertyId?: string;
    scheduledDate?: string;
    reservationId?: string;
  }): Promise<WakeUpCall[]> {
    const query = new URLSearchParams();
    if (params.propertyId) query.set('propertyId', params.propertyId);
    if (params.scheduledDate) query.set('scheduledDate', params.scheduledDate);
    if (params.reservationId) query.set('reservationId', params.reservationId);
    return apiClient.get<WakeUpCall[]>(
      `/wake-up-calls?${query.toString()}`,
      authToken(),
    );
  },

  async create(data: CreateWakeUpCallDto): Promise<WakeUpCall> {
    return apiClient.post<WakeUpCall>('/wake-up-calls', data, authToken());
  },

  async complete(id: string, completedBy: string): Promise<WakeUpCall> {
    return apiClient.post<WakeUpCall>(
      `/wake-up-calls/${id}/complete`,
      { completedBy },
      authToken(),
    );
  },

  async miss(id: string, missedBy: string): Promise<WakeUpCall> {
    return apiClient.post<WakeUpCall>(
      `/wake-up-calls/${id}/miss`,
      { missedBy },
      authToken(),
    );
  },

  async cancel(
    id: string,
    cancelledBy: string,
    cancelReason?: string,
  ): Promise<WakeUpCall> {
    return apiClient.post<WakeUpCall>(
      `/wake-up-calls/${id}/cancel`,
      { cancelledBy, cancelReason },
      authToken(),
    );
  },
};
