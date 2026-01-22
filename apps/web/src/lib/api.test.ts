import { reservationsAPI } from './api/reservations';
import { apiClient, getAuthToken } from './api/client';

// Mock the entire client module
jest.mock('./api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  getAuthToken: jest.fn(() => 'mock-token'),
}));

describe('reservationsAPI', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all reservations', async () => {
      const mockReservations = [
        {
          id: '1',
          confirmNumber: 'TEST-001',
          status: 'CONFIRMED' as const,
          checkIn: '2024-01-01',
          checkOut: '2024-01-03',
          nights: 2,
          totalAmount: 3000,
          adults: 2,
          children: 0,
          numberOfGuests: 2,
          roomRate: 1500,
          paidAmount: 0,
          roomId: 'room-1',
          guestId: 'guest-1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce(mockReservations);

      const result = await reservationsAPI.getAll();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reservations',
        'mock-token',
      );
      expect(result).toEqual(mockReservations);
    });

    it('should handle filters correctly', async () => {
      const mockReservations: never[] = [];
      mockApiClient.get.mockResolvedValueOnce(mockReservations);

      await reservationsAPI.getAll({
        propertyId: 'prop-1',
        status: 'CONFIRMED',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reservations?propertyId=prop-1&status=CONFIRMED',
        'mock-token',
      );
    });

    it('should handle fetch errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(reservationsAPI.getAll()).rejects.toThrow('Network error');
    });
  });
});
