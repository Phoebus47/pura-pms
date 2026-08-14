import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportsAPI } from './reports';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('reportsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls GET /financial/reports/drr with property and date', async () => {
    const report = {
      businessDate: '2026-08-14',
      propertyId: 'prop-1',
      summary: { ROOM: { net: 1000, tax: 70, service: 100, total: 1170 } },
      totalRevenue: 1170,
    };
    vi.mocked(apiClient.get).mockResolvedValue(report);

    const result = await reportsAPI.getDailyRevenueReport(
      'prop-1',
      '2026-08-14',
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      '/financial/reports/drr?propertyId=prop-1&date=2026-08-14',
      'token123',
    );
    expect(result).toEqual(report);
  });

  it('calls GET /financial/reports/flash with property and date', async () => {
    const flash = {
      businessDate: '2026-08-14',
      propertyId: 'prop-1',
      occupancy: { totalRooms: 10, occupiedRooms: 1, occupancyRate: 10 },
      arrivals: 0,
      departures: 0,
      stayOvers: 1,
      roomRevenue: 1170,
      totalRevenue: 1404,
    };
    vi.mocked(apiClient.get).mockResolvedValue(flash);

    const result = await reportsAPI.getDailyFlash('prop-1', '2026-08-14');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/financial/reports/flash?propertyId=prop-1&date=2026-08-14',
      'token123',
    );
    expect(result).toEqual(flash);
  });

  it('posts GL journals for a property and date', async () => {
    const { apiClient } = await import('./client');
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'je-1' });

    const result = await reportsAPI.postJournals('prop-1', '2026-08-14');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/financial/journals',
      {
        propertyId: 'prop-1',
        businessDate: '2026-08-14',
        source: 'MANUAL',
        postedBy: 'usr_mock_1',
      },
      'token123',
    );
    expect(result).toEqual({ id: 'je-1' });
  });

  it('calls GET /financial/reports/trial-balance', async () => {
    const tb = {
      businessDate: '2026-08-14',
      propertyId: 'prop-1',
      rows: [],
      totalDebit: 0,
      totalCredit: 0,
    };
    vi.mocked(apiClient.get).mockResolvedValue(tb);

    const result = await reportsAPI.getTrialBalance('prop-1', '2026-08-14');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/financial/reports/trial-balance?propertyId=prop-1&date=2026-08-14',
      'token123',
    );
    expect(result).toEqual(tb);
  });
});
