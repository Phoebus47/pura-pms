import { roomsAPI, type Room } from './rooms';
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

describe('roomsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthToken as any).mockReturnValue('token123');
  });

  describe('getAll', () => {
    it('should call apiClient.get without filters', async () => {
      const mockRooms = [
        {
          id: '1',
          number: '101',
          status: 'VACANT_CLEAN' as const,
          roomTypeId: 'type1',
          propertyId: 'prop1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      (apiClient.get as any).mockResolvedValue(mockRooms);

      const result = await roomsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/rooms', 'token123');
      expect(result).toEqual(mockRooms);
    });

    it('should call apiClient.get with filters', async () => {
      const mockRooms: Room[] = [];
      const filters = {
        propertyId: 'prop1',
        roomTypeId: 'type1',
        status: 'VACANT_CLEAN' as const,
      };

      (apiClient.get as any).mockResolvedValue(mockRooms);

      const result = await roomsAPI.getAll(filters);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/rooms?propertyId=prop1&roomTypeId=type1&status=VACANT_CLEAN',
        'token123',
      );
      expect(result).toEqual(mockRooms);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue([]);
      await roomsAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/rooms', undefined);
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with correct id', async () => {
      const mockRoom = {
        id: '1',
        number: '101',
        status: 'VACANT_CLEAN' as const,
        roomTypeId: 'type1',
        propertyId: 'prop1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.get as any).mockResolvedValue(mockRoom);

      const result = await roomsAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/rooms/1', 'token123');
      expect(result).toEqual(mockRoom);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue({});
      await roomsAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/rooms/1', undefined);
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct data', async () => {
      const createDto = {
        number: '101',
        roomTypeId: 'type1',
        propertyId: 'prop1',
      };
      const mockRoom = {
        id: '1',
        ...createDto,
        status: 'VACANT_CLEAN' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue(mockRoom);

      const result = await roomsAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/rooms',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockRoom);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.post as any).mockResolvedValue({});
      await roomsAPI.create({
        number: '101',
        roomTypeId: 't1',
        propertyId: 'p1',
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/rooms',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with correct data', async () => {
      const updateDto = { number: '102' };
      const mockRoom = {
        id: '1',
        number: '102',
        status: 'VACANT_CLEAN' as const,
        roomTypeId: 'type1',
        propertyId: 'prop1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as any).mockResolvedValue(mockRoom);

      const result = await roomsAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/rooms/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockRoom);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.patch as any).mockResolvedValue({});
      await roomsAPI.update('1', {});
      expect(apiClient.patch).toHaveBeenCalledWith('/rooms/1', {}, undefined);
    });
  });

  describe('updateStatus', () => {
    it('should call apiClient.patch with status', async () => {
      const mockRoom = {
        id: '1',
        number: '101',
        status: 'OCCUPIED_CLEAN' as const,
        roomTypeId: 'type1',
        propertyId: 'prop1',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as any).mockResolvedValue(mockRoom);

      const result = await roomsAPI.updateStatus('1', 'OCCUPIED_CLEAN');

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/rooms/1/status',
        { status: 'OCCUPIED_CLEAN' },
        'token123',
      );
      expect(result).toEqual(mockRoom);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.patch as any).mockResolvedValue({});
      await roomsAPI.updateStatus('1', 'VACANT_CLEAN');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/rooms/1/status',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call apiClient.delete with correct id', async () => {
      (apiClient.delete as any).mockResolvedValue(undefined);

      await roomsAPI.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/rooms/1', 'token123');
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.delete as any).mockResolvedValue(undefined);
      await roomsAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/rooms/1', undefined);
    });
  });

  describe('checkAvailability', () => {
    it('should call apiClient.get with availability params', async () => {
      const params = {
        propertyId: 'prop1',
        checkIn: '2024-01-15',
        checkOut: '2024-01-17',
        roomTypeId: 'type1',
      };
      const mockAvailability = { available: true };

      (apiClient.get as any).mockResolvedValue(mockAvailability);

      const result = await roomsAPI.checkAvailability(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/rooms/availability?propertyId=prop1&checkIn=2024-01-15&checkOut=2024-01-17&roomTypeId=type1',
        'token123',
      );
      expect(result).toEqual(mockAvailability);
    });

    it('should call apiClient.get without roomTypeId', async () => {
      const params = {
        propertyId: 'prop1',
        checkIn: '2024-01-15',
        checkOut: '2024-01-17',
      };
      const mockAvailability = { available: true };

      (apiClient.get as any).mockResolvedValue(mockAvailability);

      const result = await roomsAPI.checkAvailability(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        '/rooms/availability?propertyId=prop1&checkIn=2024-01-15&checkOut=2024-01-17',
        'token123',
      );
      expect(result).toEqual(mockAvailability);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue({});
      await roomsAPI.checkAvailability({
        propertyId: 'p1',
        checkIn: 'd1',
        checkOut: 'd2',
      });
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/rooms/availability'),
        undefined,
      );
    });
  });
});
