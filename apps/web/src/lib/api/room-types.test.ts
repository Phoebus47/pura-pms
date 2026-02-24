import { roomTypesAPI, type RoomType } from './room-types';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, getAuthToken } from './client';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getAuthToken: vi.fn(),
}));

describe('roomTypesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthToken as any).mockReturnValue('token123');
  });

  describe('getAll', () => {
    it('should call apiClient.get without propertyId', async () => {
      const mockRoomTypes = [
        {
          id: '1',
          name: 'Standard Room',
          code: 'STD',
          baseRate: 1000,
          maxAdults: 2,
          maxChildren: 0,
          maxOccupancy: 2,
          amenities: [],
          propertyId: 'prop1',
        },
      ];

      (apiClient.get as any).mockResolvedValue(mockRoomTypes);

      const result = await roomTypesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/room-types', 'token123');
      expect(result).toEqual(mockRoomTypes);
    });

    it('should call apiClient.get with propertyId', async () => {
      const mockRoomTypes: RoomType[] = [];
      const propertyId = 'prop1';

      (apiClient.get as any).mockResolvedValue(mockRoomTypes);

      const result = await roomTypesAPI.getAll(propertyId);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/room-types?propertyId=prop1',
        'token123',
      );
      expect(result).toEqual(mockRoomTypes);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue([]);
      await roomTypesAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/room-types', undefined);
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with correct id', async () => {
      const mockRoomType = {
        id: '1',
        name: 'Standard Room',
        code: 'STD',
        baseRate: 1000,
        maxAdults: 2,
        maxChildren: 0,
        maxOccupancy: 2,
        amenities: [],
        propertyId: 'prop1',
      };

      (apiClient.get as any).mockResolvedValue(mockRoomType);

      const result = await roomTypesAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/room-types/1', 'token123');
      expect(result).toEqual(mockRoomType);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue({});
      await roomTypesAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/room-types/1', undefined);
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct data', async () => {
      const createDto = {
        name: 'Standard Room',
        code: 'STD',
        baseRate: 1000,
        propertyId: 'prop1',
      };
      const mockRoomType = {
        id: '1',
        ...createDto,
        maxAdults: 2,
        maxChildren: 0,
        maxOccupancy: 2,
        amenities: [],
      };

      (apiClient.post as any).mockResolvedValue(mockRoomType);

      const result = await roomTypesAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/room-types',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockRoomType);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.post as any).mockResolvedValue({});
      await roomTypesAPI.create({
        name: 'N',
        code: 'C',
        baseRate: 100,
        propertyId: 'P',
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/room-types',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with correct data', async () => {
      const updateDto = { name: 'Deluxe Room' };
      const mockRoomType = {
        id: '1',
        name: 'Deluxe Room',
        code: 'STD',
        baseRate: 1000,
        maxAdults: 2,
        maxChildren: 0,
        maxOccupancy: 2,
        amenities: [],
        propertyId: 'prop1',
      };

      (apiClient.patch as any).mockResolvedValue(mockRoomType);

      const result = await roomTypesAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/room-types/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockRoomType);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.patch as any).mockResolvedValue({});
      await roomTypesAPI.update('1', {});
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/room-types/1',
        {},
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call apiClient.delete with correct id', async () => {
      (apiClient.delete as any).mockResolvedValue(undefined);

      await roomTypesAPI.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/room-types/1',
        'token123',
      );
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.delete as any).mockResolvedValue(undefined);
      await roomTypesAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/room-types/1', undefined);
    });
  });
});
