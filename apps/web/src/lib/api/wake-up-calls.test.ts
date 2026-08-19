import { wakeUpCallsAPI } from './wake-up-calls';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('wakeUpCallsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists by property and date', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await wakeUpCallsAPI.list({
      propertyId: 'prop-1',
      scheduledDate: '2026-08-19',
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/wake-up-calls?propertyId=prop-1&scheduledDate=2026-08-19',
      'token',
    );
  });

  it('creates a call', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'wu-1' });
    await wakeUpCallsAPI.create({
      reservationId: 'res-1',
      scheduledAt: '2026-08-19T06:00:00.000Z',
      scheduledBy: 'user-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/wake-up-calls',
      expect.objectContaining({ reservationId: 'res-1' }),
      'token',
    );
  });
});
