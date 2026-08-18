import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { yieldAPI } from './yield';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('yieldAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads pace with optional dates', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ days: [] });
    await yieldAPI.getPace('prop-1', '2026-08-18', '2026-08-20');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/yield/pace?propertyId=prop-1&from=2026-08-18&to=2026-08-20',
      'token123',
    );
  });

  it('generates and applies recommendations', async () => {
    vi.mocked(apiClient.post).mockResolvedValue([]);
    await yieldAPI.generateRecommendations('prop-1');
    await yieldAPI.applyRecommendation('rec-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/yield/recommendations/generate',
      { propertyId: 'prop-1' },
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/yield/recommendations/rec-1/apply',
      {},
      'token123',
    );
  });

  it('creates a competitor rate', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'comp-1' });
    await yieldAPI.createCompetitor({
      propertyId: 'prop-1',
      competitorName: 'Hotel B',
      stayDate: '2026-08-20',
      amount: 900,
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/yield/competitors',
      expect.objectContaining({ competitorName: 'Hotel B' }),
      'token123',
    );
  });
});
