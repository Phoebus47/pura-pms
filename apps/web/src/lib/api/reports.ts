import { apiClient, getAuthToken } from './client';

export interface RevenueBucket {
  net: number;
  tax: number;
  service: number;
  total: number;
}

export interface DailyRevenueReport {
  businessDate: string;
  propertyId: string;
  summary: Record<string, RevenueBucket>;
  totalRevenue: number;
}

function authToken(): string | undefined {
  return getAuthToken() || undefined;
}

export const reportsAPI = {
  async getDailyRevenueReport(
    propertyId: string,
    date: string,
  ): Promise<DailyRevenueReport> {
    const query = new URLSearchParams({ propertyId, date });
    return apiClient.get<DailyRevenueReport>(
      `/financial/reports/drr?${query.toString()}`,
      authToken(),
    );
  },
};
