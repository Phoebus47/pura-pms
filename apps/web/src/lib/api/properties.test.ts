import { propertiesAPI } from './properties';
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

describe('propertiesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthToken as any).mockReturnValue('token123');
  });

  describe('getAll', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      const mockProperties = [
        {
          id: '1',
          name: 'Property A',
          currency: 'THB',
          timezone: 'Asia/Bangkok',
          createdAt: '2024-01-01T00:00:00Z',
        },
      ];

      (apiClient.get as any).mockResolvedValue(mockProperties);

      const result = await propertiesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/properties', 'token123');
      expect(result).toEqual(mockProperties);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue([]);
      await propertiesAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/properties', undefined);
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with correct id', async () => {
      const mockProperty = {
        id: '1',
        name: 'Property A',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
        createdAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.get as any).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/properties/1', 'token123');
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.get as any).mockResolvedValue({});
      await propertiesAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/properties/1', undefined);
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct data', async () => {
      const createDto = {
        name: 'Property A',
        address: '123 Main St',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      };
      const mockProperty = {
        id: '1',
        ...createDto,
        createdAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.post as any).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/properties',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.post as any).mockResolvedValue({});
      await propertiesAPI.create({
        name: 'A',
        address: 'B',
        currency: 'USD',
        timezone: 'UTC',
      });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/properties',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with correct data', async () => {
      const updateDto = { name: 'Property B' };
      const mockProperty = {
        id: '1',
        name: 'Property B',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
        createdAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as any).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/properties/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.patch as any).mockResolvedValue({});
      await propertiesAPI.update('1', {});
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/properties/1',
        {},
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call apiClient.delete with correct id', async () => {
      (apiClient.delete as any).mockResolvedValue(undefined);

      await propertiesAPI.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/properties/1',
        'token123',
      );
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as any).mockReturnValue(null);
      (apiClient.delete as any).mockResolvedValue(undefined);
      await propertiesAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/properties/1', undefined);
    });
  });
});
