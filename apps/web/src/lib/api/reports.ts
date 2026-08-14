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

export interface DailyFlashReport {
  businessDate: string;
  propertyId: string;
  occupancy: {
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
  };
  arrivals: number;
  departures: number;
  stayOvers: number;
  roomRevenue: number;
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

  async getDailyFlash(
    propertyId: string,
    date: string,
  ): Promise<DailyFlashReport> {
    const query = new URLSearchParams({ propertyId, date });
    return apiClient.get<DailyFlashReport>(
      `/financial/reports/flash?${query.toString()}`,
      authToken(),
    );
  },
};
