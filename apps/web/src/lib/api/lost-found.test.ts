import { lostFoundAPI } from './lost-found';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('lostFoundAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists by property', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await lostFoundAPI.list({ propertyId: 'prop-1' });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/lost-found?propertyId=prop-1',
      'token',
    );
  });

  it('creates an item', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'lf-1' });
    await lostFoundAPI.create({
      propertyId: 'prop-1',
      itemDescription: 'Wallet',
      locationFound: 'Lobby',
      foundBy: 'user-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/lost-found',
      expect.objectContaining({ itemDescription: 'Wallet' }),
      'token',
    );
  });

  it('claims an item', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'lf-1' });
    await lostFoundAPI.claim('lf-1', 'user-1');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/lost-found/lf-1/claim',
      { claimedBy: 'user-1', guestId: undefined },
      'token',
    );
  });

  it('returns an item', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'lf-1' });
    await lostFoundAPI.returnItem('lf-1', 'Ann Guest');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/lost-found/lf-1/return',
      { returnedTo: 'Ann Guest' },
      'token',
    );
  });

  it('disposes an item', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'lf-1' });
    await lostFoundAPI.dispose('lf-1', 'user-1', 'Expired');
    expect(apiClient.post).toHaveBeenCalledWith(
      '/lost-found/lf-1/dispose',
      { disposedBy: 'user-1', disposeReason: 'Expired' },
      'token',
    );
  });
});
