import { portalAPI } from './portal';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('portalAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the reservation summary with the guest last name gate', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: 'res-1' });

    await portalAPI.getReservation('CN-123', 'Smith');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/portal/reservations/CN-123?lastName=Smith',
    );
  });

  it('fetches the folio summary with the guest last name gate', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);

    await portalAPI.getFolio('CN-123', 'Smith');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/portal/reservations/CN-123/folio?lastName=Smith',
    );
  });

  it('encodes special characters in the last name query param', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ id: 'res-1' });

    await portalAPI.getReservation('CN-123', "O'Brien & Co");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/portal/reservations/CN-123?lastName=O'Brien%20%26%20Co",
    );
  });

  it('posts a guest service request', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'msg-1' });

    await portalAPI.requestService('CN-123', {
      lastName: 'Smith',
      content: 'Extra towels please',
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/portal/reservations/CN-123/messages',
      { lastName: 'Smith', content: 'Extra towels please' },
    );
  });
});
