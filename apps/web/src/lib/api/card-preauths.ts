import { apiClient, getAuthToken } from './client';

export type CardPreauthStatus =
  | 'HELD'
  | 'INCREMENTAL'
  | 'CAPTURED'
  | 'RELEASED'
  | 'EXPIRED';

export interface CardPreauth {
  id: string;
  reservationId: string;
  amount: number;
  status: CardPreauthStatus;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  manualRef: string;
  capturedAmount: number | null;
  folioId: string | null;
  createdBy: string;
}

export interface CreateCardPreauthDto {
  reservationId: string;
  amount: number;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  manualRef: string;
  createdBy: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const cardPreauthsAPI = {
  async list(reservationId?: string): Promise<CardPreauth[]> {
    const params = reservationId
      ? `?reservationId=${encodeURIComponent(reservationId)}`
      : '';
    return apiClient.get<CardPreauth[]>(`/card-preauths${params}`, authToken());
  },

  async create(data: CreateCardPreauthDto): Promise<CardPreauth> {
    return apiClient.post<CardPreauth>('/card-preauths', data, authToken());
  },

  async increment(id: string, amount: number): Promise<CardPreauth> {
    return apiClient.patch<CardPreauth>(
      `/card-preauths/${id}`,
      { amount },
      authToken(),
    );
  },

  async capture(
    id: string,
    data: { folioId: string; userId: string; amount?: number },
  ): Promise<CardPreauth> {
    return apiClient.post<CardPreauth>(
      `/card-preauths/${id}/capture`,
      data,
      authToken(),
    );
  },

  async release(id: string): Promise<CardPreauth> {
    return apiClient.post<CardPreauth>(
      `/card-preauths/${id}/release`,
      {},
      authToken(),
    );
  },
};
