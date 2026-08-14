import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exchangeRatesAPI } from './exchange-rates';
import { apiClient, getAuthToken } from './client';

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
    getAuthToken: vi.fn(),
  };
});

const mockRate = {
  id: 'fx_1',
  baseCurrency: 'THB',
  targetCurrency: 'USD',
  rate: 35,
  effectiveDate: '2026-08-14T00:00:00.000Z',
  isActive: true,
  createdAt: '2026-08-14T00:00:00.000Z',
};

describe('exchangeRatesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  it('lists active rates via GET /exchange-rates', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockRate]);

    const result = await exchangeRatesAPI.list();

    expect(apiClient.get).toHaveBeenCalledWith('/exchange-rates', 'token123');
    expect(result).toEqual([mockRate]);
  });

  it('looks up a rate for a pair and date', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockRate);

    const result = await exchangeRatesAPI.findForDate({
      baseCurrency: 'THB',
      targetCurrency: 'USD',
      date: '2026-08-14',
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/exchange-rates?baseCurrency=THB&targetCurrency=USD&date=2026-08-14',
      'token123',
    );
    expect(result).toEqual(mockRate);
  });

  it('creates a rate via POST /exchange-rates', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockRate);

    const payload = {
      baseCurrency: 'THB',
      targetCurrency: 'USD',
      rate: 35,
      effectiveDate: '2026-08-14',
    };
    const result = await exchangeRatesAPI.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/exchange-rates',
      payload,
      'token123',
    );
    expect(result).toEqual(mockRate);
  });

  it('updates a rate via PATCH /exchange-rates/:id', async () => {
    const updated = { ...mockRate, isActive: false };
    vi.mocked(apiClient.patch).mockResolvedValue(updated);

    const result = await exchangeRatesAPI.update('fx_1', { isActive: false });

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/exchange-rates/fx_1',
      { isActive: false },
      'token123',
    );
    expect(result.isActive).toBe(false);
  });
});
