import { mobileCheckInAPI } from './mobile-check-in';
import { apiClient } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('mobileCheckInAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('looks up a reservation by confirmation number', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ confirmNumber: 'CN-123' });

    await mobileCheckInAPI.lookup('CN-123');

    expect(apiClient.get).toHaveBeenCalledWith('/mobile-check-in/CN-123');
  });

  it('includes an encoded last name query when provided', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ confirmNumber: 'CN-123' });

    await mobileCheckInAPI.lookup('CN-123', 'Van Der Berg');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/mobile-check-in/CN-123?lastName=Van%20Der%20Berg',
    );
  });

  it('fetches available rooms for the reservation', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([]);

    await mobileCheckInAPI.getAvailableRooms('CN-123', 'Doe');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/mobile-check-in/CN-123/rooms?lastName=Doe',
    );
  });

  it('posts a room selection', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ confirmNumber: 'CN-123' });

    await mobileCheckInAPI.selectRoom('CN-123', 'room-2', 'Doe');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/mobile-check-in/CN-123/room',
      {
        roomId: 'room-2',
        lastName: 'Doe',
      },
    );
  });

  it('posts a check-in request', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      reservation: { confirmNumber: 'CN-123' },
      digitalKey: { status: 'UNAVAILABLE', message: 'stub' },
    });

    await mobileCheckInAPI.checkIn('CN-123', 'Doe');

    expect(apiClient.post).toHaveBeenCalledWith(
      '/mobile-check-in/CN-123/check-in',
      { lastName: 'Doe' },
    );
  });
});
