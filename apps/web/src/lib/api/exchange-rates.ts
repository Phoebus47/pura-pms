import { apiClient, getAuthToken } from './client';

export interface ExchangeRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateExchangeRateDto {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  effectiveDate: string;
}

export interface UpdateExchangeRateDto {
  rate?: number;
  isActive?: boolean;
}

export interface FindExchangeRateQuery {
  baseCurrency: string;
  targetCurrency: string;
  date: string;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const exchangeRatesAPI = {
  async list(): Promise<ExchangeRate[]> {
    return apiClient.get<ExchangeRate[]>('/exchange-rates', authToken());
  },

  async findForDate(query: FindExchangeRateQuery): Promise<ExchangeRate> {
    const params = new URLSearchParams({
      baseCurrency: query.baseCurrency,
      targetCurrency: query.targetCurrency,
      date: query.date,
    });
    return apiClient.get<ExchangeRate>(
      `/exchange-rates?${params.toString()}`,
      authToken(),
    );
  },

  async create(data: CreateExchangeRateDto): Promise<ExchangeRate> {
    return apiClient.post<ExchangeRate>('/exchange-rates', data, authToken());
  },

  async update(id: string, data: UpdateExchangeRateDto): Promise<ExchangeRate> {
    return apiClient.patch<ExchangeRate>(
      `/exchange-rates/${id}`,
      data,
      authToken(),
    );
  },
};
