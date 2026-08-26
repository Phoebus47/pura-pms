import { digitalKeysAPI } from './digital-keys';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getAuthToken: vi.fn(() => 'token'),
}));

import { apiClient } from './client';

describe('digitalKeysAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists by property and reservation', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);
    await digitalKeysAPI.list({
      propertyId: 'prop-1',
      reservationId: 'res-1',
    });
    expect(apiClient.get).toHaveBeenCalledWith(
      '/digital-keys?propertyId=prop-1&reservationId=res-1',
      'token',
    );
  });

  it('fetches a single key by id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: 'dk-1' });
    await digitalKeysAPI.getById('dk-1');
    expect(apiClient.get).toHaveBeenCalledWith('/digital-keys/dk-1', 'token');
  });

  it('issues a key by reservation id', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'dk-1' });
    await digitalKeysAPI.issue({
      reservationId: 'res-1',
      issuedBy: 'usr-1',
      transport: 'BLE',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/digital-keys/issue',
      { reservationId: 'res-1', issuedBy: 'usr-1', transport: 'BLE' },
      'token',
    );
  });

  it('issues a key by confirmation number', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'dk-1' });
    await digitalKeysAPI.issueByConfirmNumber({
      confirmNumber: 'CN-1',
      issuedBy: 'usr-1',
    });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/digital-keys/issue-by-confirm',
      { confirmNumber: 'CN-1', issuedBy: 'usr-1' },
      'token',
    );
  });

  it('revokes a key', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'dk-1' });
    await digitalKeysAPI.revoke('dk-1', { revokedBy: 'usr-1' });
    expect(apiClient.post).toHaveBeenCalledWith(
      '/digital-keys/dk-1/revoke',
      { revokedBy: 'usr-1' },
      'token',
    );
  });
});
