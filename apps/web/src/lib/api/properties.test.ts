import { propertiesAPI } from './properties';
import { apiClient, getAuthToken } from './client';

jest.mock('./client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  getAuthToken: jest.fn(),
}));

describe('propertiesAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthToken as jest.Mock).mockReturnValue('token123');
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

      (apiClient.get as jest.Mock).mockResolvedValue(mockProperties);

      const result = await propertiesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/properties', 'token123');
      expect(result).toEqual(mockProperties);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.get as jest.Mock).mockResolvedValue([]);
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

      (apiClient.get as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/properties/1', 'token123');
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.get as jest.Mock).mockResolvedValue({});
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

      (apiClient.post as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/properties',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.post as jest.Mock).mockResolvedValue({});
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

      (apiClient.patch as jest.Mock).mockResolvedValue(mockProperty);

      const result = await propertiesAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/properties/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockProperty);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.patch as jest.Mock).mockResolvedValue({});
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
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await propertiesAPI.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/properties/1',
        'token123',
      );
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);
      await propertiesAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/properties/1', undefined);
    });
  });
});
