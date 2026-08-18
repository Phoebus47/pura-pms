import { apiClient, getAuthToken } from './client';

export type RateDeriveMode = 'PERCENT_OFFSET' | 'AMOUNT_OFFSET';

export interface Rate {
  id: string;
  code: string;
  name: string;
  roomTypeId: string;
  propertyId: string;
  amount: number;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  isActive: boolean;
  parentRateId?: string | null;
  deriveMode?: RateDeriveMode | null;
  deriveValue?: number | null;
  roomType?: { id: string; name: string; code: string };
  parentRate?: {
    id: string;
    code: string;
    name: string;
    amount: number;
  } | null;
  _count?: { childRates: number };
}

export interface CreateRateDto {
  code: string;
  name: string;
  roomTypeId: string;
  propertyId: string;
  amount?: number;
  startDate: string;
  endDate: string;
  daysOfWeek?: number[];
  isActive?: boolean;
  parentRateId?: string;
  deriveMode?: RateDeriveMode;
  deriveValue?: number;
}

export type UpdateRateDto = Partial<CreateRateDto>;

function authToken() {
  return getAuthToken() || undefined;
}

export const ratesAPI = {
  async getAll(propertyId?: string, roomTypeId?: string): Promise<Rate[]> {
    const params = new URLSearchParams();
    if (propertyId) params.set('propertyId', propertyId);
    if (roomTypeId) params.set('roomTypeId', roomTypeId);
    const query = params.toString();
    const endpoint = query ? `/rates?${query}` : '/rates';
    return apiClient.get<Rate[]>(endpoint, authToken());
  },

  async getById(id: string): Promise<Rate> {
    return apiClient.get<Rate>(`/rates/${id}`, authToken());
  },

  async create(data: CreateRateDto): Promise<Rate> {
    return apiClient.post<Rate>('/rates', data, authToken());
  },

  async update(id: string, data: UpdateRateDto): Promise<Rate> {
    return apiClient.patch<Rate>(`/rates/${id}`, data, authToken());
  },
};
