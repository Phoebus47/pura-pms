import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { blocksAPI } from './blocks';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('blocksAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists blocks for a property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await blocksAPI.getAll('prop-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/blocks?propertyId=prop-1',
      'token123',
    );
  });

  it('creates a block and fetches pickup', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'block-1' });
    vi.mocked(apiClient.get).mockResolvedValue({ nights: [] });
    await blocksAPI.create({
      propertyId: 'prop-1',
      roomTypeId: 'rt-1',
      code: 'OTA',
      name: 'OTA',
      kind: 'ALLOTMENT',
      startDate: '2026-08-18',
      endDate: '2026-08-20',
      cutoffDate: '2026-08-17',
      allottedRooms: 2,
    });
    await blocksAPI.getPickup('block-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/blocks',
      expect.objectContaining({ code: 'OTA' }),
      'token123',
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      '/blocks/block-1/pickup',
      'token123',
    );
  });
});
