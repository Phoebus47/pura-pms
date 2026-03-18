import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nightAuditAPI } from './night-audit';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('nightAuditAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('calls apiClient.post with correct parameters', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        id: 'audit-1',
      } as unknown as never);

      const result = await nightAuditAPI.start(
        'prop-1',
        '2025-01-15T00:00:00Z',
      );

      expect(apiClient.post).toHaveBeenCalledWith('/night-audit/run', {
        propertyId: 'prop-1',
        businessDate: '2025-01-15T00:00:00Z',
      });
      expect(result).toEqual({ id: 'audit-1' });
    });
  });

  describe('getStatus', () => {
    it('calls apiClient.get with correct url', async () => {
      const expectedStatus = { id: 'audit-1', status: 'IN_PROGRESS' };
      vi.mocked(apiClient.get).mockResolvedValue(
        expectedStatus as unknown as never,
      );

      const result = await nightAuditAPI.getStatus(
        'prop-1',
        '2025-01-15T00:00:00Z',
      );

      expect(apiClient.get).toHaveBeenCalledWith(
        '/night-audit/status/prop-1/2025-01-15T00:00:00Z',
      );
      expect(result).toEqual(expectedStatus);
    });
  });
});
