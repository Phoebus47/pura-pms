import { apiClient, getAuthToken } from './client';

export type RegistrationCardStatus = 'DRAFT' | 'SIGNED' | 'VOID';

export interface GuestSnapshot {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  idType: string | null;
  idNumber: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  address: string | null;
}

export interface StaySnapshot {
  confirmNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  roomNumber: string;
  roomTypeName: string | null;
  rateCode: string | null;
  roomRate: number;
}

export interface PropertySnapshot {
  name: string;
  address: string | null;
  phone: string | null;
  taxId: string | null;
}

export interface RegistrationCard {
  id: string;
  propertyId: string;
  reservationId: string;
  version: number;
  status: RegistrationCardStatus;
  guestSnapshot: GuestSnapshot;
  staySnapshot: StaySnapshot;
  propertySnapshot: PropertySnapshot;
  signatureData: string | null;
  signedAt: string | null;
  signedByGuestName: string | null;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
  };
  property?: { id: string; name: string };
}

export interface CreateRegistrationCardDto {
  reservationId: string;
  createdBy: string;
}

export interface SignRegistrationCardDto {
  signatureData: string;
  signedByGuestName: string;
}

export interface VoidRegistrationCardDto {
  reason: string;
  voidedBy: string;
}

export interface CreateRegCardPrintJobDto {
  requestedBy: string;
  idempotencyKey?: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const registrationCardsAPI = {
  async listByReservation(reservationId: string): Promise<RegistrationCard[]> {
    const params = new URLSearchParams({ reservationId });
    return apiClient.get<RegistrationCard[]>(
      `/registration-cards?${params.toString()}`,
      authToken(),
    );
  },

  async getById(id: string): Promise<RegistrationCard> {
    return apiClient.get<RegistrationCard>(
      `/registration-cards/${id}`,
      authToken(),
    );
  },

  async createDraft(
    data: CreateRegistrationCardDto,
  ): Promise<RegistrationCard> {
    return apiClient.post<RegistrationCard>(
      '/registration-cards',
      data,
      authToken(),
    );
  },

  async sign(
    id: string,
    data: SignRegistrationCardDto,
  ): Promise<RegistrationCard> {
    return apiClient.post<RegistrationCard>(
      `/registration-cards/${id}/sign`,
      data,
      authToken(),
    );
  },

  async void(
    id: string,
    data: VoidRegistrationCardDto,
  ): Promise<RegistrationCard> {
    return apiClient.post<RegistrationCard>(
      `/registration-cards/${id}/void`,
      data,
      authToken(),
    );
  },

  async createPrintJob(
    id: string,
    data: CreateRegCardPrintJobDto,
  ): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(
      `/registration-cards/${id}/print-job`,
      data,
      authToken(),
    );
  },
};
