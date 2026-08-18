import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { ratesAPI } from './rates';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('ratesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists rates via GET /rates', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await ratesAPI.getAll();
    expect(apiClient.get).toHaveBeenCalledWith('/rates', 'token123');
  });

  it('filters rates by property and room type', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await ratesAPI.getAll('prop-1', 'rt-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/rates?propertyId=prop-1&roomTypeId=rt-1',
      'token123',
    );
  });

  it('fetches a rate by id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: 'rate-1' });
    await ratesAPI.getById('rate-1');
    expect(apiClient.get).toHaveBeenCalledWith('/rates/rate-1', 'token123');
  });

  it('creates a rate via POST /rates', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'rate-1' });
    await ratesAPI.create({
      code: 'BAR',
      name: 'Best Available',
      roomTypeId: 'rt-1',
      propertyId: 'prop-1',
      amount: 1500,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/rates',
      expect.objectContaining({ code: 'BAR', amount: 1500 }),
      'token123',
    );
  });

  it('updates a rate via PATCH /rates/:id', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 'rate-1' });
    await ratesAPI.update('rate-1', { amount: 1800 });
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/rates/rate-1',
      { amount: 1800 },
      'token123',
    );
  });
});
