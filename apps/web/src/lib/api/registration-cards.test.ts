import { registrationCardsAPI } from './registration-cards';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('registrationCardsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists cards by reservation', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await registrationCardsAPI.listByReservation('res-1');
    expect(apiClient.get).toHaveBeenCalledWith(
      '/registration-cards?reservationId=res-1',
      'token',
    );
  });

  it('creates draft', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'rc-1' });
    await registrationCardsAPI.createDraft({
      reservationId: 'res-1',
      createdBy: 'user-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/registration-cards',
      { reservationId: 'res-1', createdBy: 'user-1' },
      'token',
    );
  });
});
