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

export interface JournalLine {
  id: string;
  debit: number;
  credit: number;
  account?: { code: string; name: string };
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  source: string;
  isPosted: boolean;
  lines: JournalLine[];
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

  async listJournals(
    propertyId: string,
    date: string,
  ): Promise<JournalEntry[]> {
    const query = new URLSearchParams({ propertyId, date });
    return apiClient.get<JournalEntry[]>(
      `/financial/journals?${query.toString()}`,
      authToken(),
    );
  },

  async postJournals(propertyId: string, date: string): Promise<JournalEntry> {
    return apiClient.post<JournalEntry>(
      '/financial/journals',
      {
        propertyId,
        businessDate: date,
        source: 'MANUAL',
        postedBy: 'usr_mock_1',
      },
      authToken(),
    );
  },
};
