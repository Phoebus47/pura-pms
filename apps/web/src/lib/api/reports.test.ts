import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportsAPI } from './reports';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
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
});
