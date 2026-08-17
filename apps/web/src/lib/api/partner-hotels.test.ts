import { describe, it, expect, vi, beforeEach } from 'vitest';
import { partnerHotelsAPI, type PartnerHotel } from './partner-hotels';
import { apiClient, getAuthToken } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
  getAuthToken: vi.fn(),
}));

describe('partnerHotelsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  describe('getAll', () => {
    it('should call apiClient.get without propertyId', async () => {
      const mockHotels: PartnerHotel[] = [
        {
          id: '1',
          propertyId: 'prop1',
          name: 'Grand Partner Hotel',
          isActive: true,
          createdAt: '2026-08-14',
          updatedAt: '2026-08-14',
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockHotels);

      const result = await partnerHotelsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/partner-hotels', 'token123');
      expect(result).toEqual(mockHotels);
    });

    it('should call apiClient.get with propertyId', async () => {
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await partnerHotelsAPI.getAll('prop1');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/partner-hotels?propertyId=prop1',
        'token123',
      );
    });

    it('should handle missing auth token', async () => {
      vi.mocked(getAuthToken).mockReturnValue(null);
      vi.mocked(apiClient.get).mockResolvedValue([]);

      await partnerHotelsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/partner-hotels', undefined);
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with the id', async () => {
      const mockHotel = { id: '1', name: 'Grand Partner Hotel' };
      vi.mocked(apiClient.get).mockResolvedValue(mockHotel);

      const result = await partnerHotelsAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/partner-hotels/1',
        'token123',
      );
      expect(result).toEqual(mockHotel);
    });
  });

  describe('create', () => {
    it('should call apiClient.post with the payload', async () => {
      const createDto = { propertyId: 'prop1', name: 'Grand Partner Hotel' };
      const mockHotel = { id: '1', ...createDto, isActive: true };
      vi.mocked(apiClient.post).mockResolvedValue(mockHotel);

      const result = await partnerHotelsAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/partner-hotels',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockHotel);
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with the payload', async () => {
      const updateDto = { isActive: false };
      const mockHotel = { id: '1', isActive: false };
      vi.mocked(apiClient.patch).mockResolvedValue(mockHotel);

      const result = await partnerHotelsAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/partner-hotels/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockHotel);
    });
  });
});
