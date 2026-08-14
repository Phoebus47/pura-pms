import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cardPreauthsAPI } from './card-preauths';
import { apiClient, getAuthToken } from './client';

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    ...actual,
    apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
    getAuthToken: vi.fn(),
  };
});

describe('cardPreauthsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  it('lists and creates holds', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'pa_1' });
    await cardPreauthsAPI.list('res_1');
    await cardPreauthsAPI.create({
      reservationId: 'res_1',
      amount: 1000,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2028,
      manualRef: 'AUTH-1',
      createdBy: 'user-1',
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/card-preauths?reservationId=res_1',
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalled();
  });

  it('increments, captures, and releases', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ id: 'pa_1' });
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'pa_1' });
    await cardPreauthsAPI.increment('pa_1', 1500);
    await cardPreauthsAPI.capture('pa_1', {
      folioId: 'fol_1',
      userId: 'user-1',
    });
    await cardPreauthsAPI.release('pa_1');
    expect(apiClient.patch).toHaveBeenCalledWith(
      '/card-preauths/pa_1',
      { amount: 1500 },
      'token123',
    );
  });
});
