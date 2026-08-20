import { kioskAPI } from './kiosk';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('kioskAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('posts kiosk check-in with confirmation number and property', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ id: 'res-1' });

    await kioskAPI.checkIn({
      confirmNumber: 'CN-123',
      propertyId: 'prop-1',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/kiosk/check-in', {
      confirmNumber: 'CN-123',
      propertyId: 'prop-1',
    });
  });
});
