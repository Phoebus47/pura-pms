import { apiClient, getAuthToken } from './client';

export type DigitalKeyTransport = 'BLE' | 'NFC';
export type DigitalKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface DigitalKey {
  id: string;
  propertyId: string;
  reservationId: string;
  roomNumber: string;
  token: string;
  transport: DigitalKeyTransport;
  status: DigitalKeyStatus;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revokedBy: string | null;
  revokedReason: string | null;
  createdAt: string;
  reservation?: {
    id: string;
    confirmNumber: string;
    status: string;
  };
}

export interface IssueDigitalKeyDto {
  reservationId: string;
  issuedBy: string;
  transport?: DigitalKeyTransport;
}

export interface IssueDigitalKeyByConfirmNumberDto {
  confirmNumber: string;
  issuedBy: string;
  transport?: DigitalKeyTransport;
}

export interface RevokeDigitalKeyDto {
  revokedBy: string;
  revokedReason?: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const digitalKeysAPI = {
  async list(params: {
    propertyId?: string;
    reservationId?: string;
  }): Promise<DigitalKey[]> {
    const query = new URLSearchParams();
    if (params.propertyId) query.set('propertyId', params.propertyId);
    if (params.reservationId) query.set('reservationId', params.reservationId);
    return apiClient.get<DigitalKey[]>(
      `/digital-keys?${query.toString()}`,
      authToken(),
    );
  },

  async getById(id: string): Promise<DigitalKey> {
    return apiClient.get<DigitalKey>(`/digital-keys/${id}`, authToken());
  },

  async issue(data: IssueDigitalKeyDto): Promise<DigitalKey> {
    return apiClient.post<DigitalKey>('/digital-keys/issue', data, authToken());
  },

  async issueByConfirmNumber(
    data: IssueDigitalKeyByConfirmNumberDto,
  ): Promise<DigitalKey> {
    return apiClient.post<DigitalKey>(
      '/digital-keys/issue-by-confirm',
      data,
      authToken(),
    );
  },

  async revoke(id: string, data: RevokeDigitalKeyDto): Promise<DigitalKey> {
    return apiClient.post<DigitalKey>(
      `/digital-keys/${id}/revoke`,
      data,
      authToken(),
    );
  },
};
