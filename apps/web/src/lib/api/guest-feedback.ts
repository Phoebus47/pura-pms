import { apiClient, getAuthToken } from './client';

export type GuestFeedbackStatus = 'OPEN' | 'REVIEWED' | 'ARCHIVED';

export interface GuestFeedback {
  id: string;
  propertyId: string;
  guestId: string;
  reservationId: string | null;
  score: number;
  comment: string | null;
  status: GuestFeedbackStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  guest?: { id: string; firstName: string; lastName: string } | null;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
  } | null;
}

export interface CreateGuestFeedbackDto {
  propertyId: string;
  guestId: string;
  reservationId?: string;
  score: number;
  comment?: string;
}

export interface ReviewGuestFeedbackDto {
  reviewedBy: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const guestFeedbackAPI = {
  async list(params: {
    propertyId: string;
    guestId?: string;
    status?: GuestFeedbackStatus;
  }): Promise<GuestFeedback[]> {
    const query = new URLSearchParams({ propertyId: params.propertyId });
    if (params.guestId) query.set('guestId', params.guestId);
    if (params.status) query.set('status', params.status);
    return apiClient.get<GuestFeedback[]>(
      `/guest-feedback?${query.toString()}`,
      authToken(),
    );
  },

  async create(data: CreateGuestFeedbackDto): Promise<GuestFeedback> {
    return apiClient.post<GuestFeedback>('/guest-feedback', data, authToken());
  },

  async review(
    id: string,
    data: ReviewGuestFeedbackDto,
  ): Promise<GuestFeedback> {
    return apiClient.post<GuestFeedback>(
      `/guest-feedback/${id}/review`,
      data,
      authToken(),
    );
  },
};
