import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './client';
import { housekeepingAPI } from './housekeeping';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token123'),
}));

describe('housekeepingAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads the board and checklist', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await housekeepingAPI.getBoard('prop-1');
    await housekeepingAPI.getChecklist();
    expect(apiClient.get).toHaveBeenCalledWith(
      '/housekeeping/board?propertyId=prop-1',
      'token123',
    );
    expect(apiClient.get).toHaveBeenCalledWith(
      '/housekeeping/checklist',
      'token123',
    );
  });

  it('marks a room clean and submits inspection', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'room-1' });
    await housekeepingAPI.markClean('room-1');
    await housekeepingAPI.inspect('room-1', {
      inspectedBy: 'usr-1',
      lines: [{ itemCode: 'BED', passed: true }],
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/housekeeping/rooms/room-1/clean',
      {},
      'token123',
    );
    expect(apiClient.post).toHaveBeenCalledWith(
      '/housekeeping/rooms/room-1/inspections',
      expect.objectContaining({ inspectedBy: 'usr-1' }),
      'token123',
    );
  });
});
