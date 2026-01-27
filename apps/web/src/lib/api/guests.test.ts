import { guestsAPI } from './guests';
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

describe('guestsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAuthToken as jest.Mock).mockReturnValue('token123');
  });

  describe('getAll', () => {
    it('should call apiClient.get without query params', async () => {
      const mockResponse = {
        data: [],
        total: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await guestsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/guests', 'token123');
      expect(result).toEqual(mockResponse);
    });

    it('should call apiClient.get with query params', async () => {
      const mockResponse = {
        data: [],
        total: 0,
      };
      const params = {
        search: 'John',
        isBlacklist: false,
        vipLevel: 1,
        limit: 10,
        offset: 0,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await guestsAPI.getAll(params);

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/guests?'),
        'token123',
      );
      const callArgs = (apiClient.get as jest.Mock).mock.calls[0];
      const endpoint = callArgs[0] as string;
      expect(endpoint).toContain('search=John');
      expect(endpoint).toContain('isBlacklist=false');
      expect(endpoint).toContain('vipLevel=1');
      expect(endpoint).toContain('limit=10');
      expect(endpoint).toContain('offset=0');
      expect(result).toEqual(mockResponse);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [], total: 0 });

      await guestsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/guests', undefined);
    });
  });

  describe('getById', () => {
    it('should call apiClient.get with correct id', async () => {
      const mockGuest = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        vipLevel: 1,
        isBlacklist: false,
        totalStays: 0,
        totalRevenue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestsAPI.getById('1');

      expect(apiClient.get).toHaveBeenCalledWith('/guests/1', 'token123');
      expect(result).toEqual(mockGuest);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.get as jest.Mock).mockResolvedValue({});
      await guestsAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/guests/1', undefined);
    });
  });

  describe('getHistory', () => {
    it('should call apiClient.get with correct endpoint', async () => {
      const mockHistory = { reservations: [] };

      (apiClient.get as jest.Mock).mockResolvedValue(mockHistory);

      const result = await guestsAPI.getHistory('1');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/guests/1/history',
        'token123',
      );
      expect(result).toEqual(mockHistory);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.get as jest.Mock).mockResolvedValue({});
      await guestsAPI.getHistory('1');
      expect(apiClient.get).toHaveBeenCalledWith(
        '/guests/1/history',
        undefined,
      );
    });
  });

  describe('create', () => {
    it('should call apiClient.post with correct data', async () => {
      const createDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      const mockGuest = {
        id: '1',
        ...createDto,
        vipLevel: 0,
        isBlacklist: false,
        totalStays: 0,
        totalRevenue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestsAPI.create(createDto);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/guests',
        createDto,
        'token123',
      );
      expect(result).toEqual(mockGuest);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.post as jest.Mock).mockResolvedValue({});
      await guestsAPI.create({ firstName: 'A', lastName: 'B' });
      expect(apiClient.post).toHaveBeenCalledWith(
        '/guests',
        expect.any(Object),
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should call apiClient.patch with correct data', async () => {
      const updateDto = { firstName: 'Jane' };
      const mockGuest = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        vipLevel: 1,
        isBlacklist: false,
        totalStays: 0,
        totalRevenue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestsAPI.update('1', updateDto);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1',
        updateDto,
        'token123',
      );
      expect(result).toEqual(mockGuest);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.patch as jest.Mock).mockResolvedValue({});
      await guestsAPI.update('1', {});
      expect(apiClient.patch).toHaveBeenCalledWith('/guests/1', {}, undefined);
    });
  });

  describe('updateVipLevel', () => {
    it('should call apiClient.patch with vipLevel', async () => {
      const mockGuest = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        vipLevel: 2,
        isBlacklist: false,
        totalStays: 0,
        totalRevenue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestsAPI.updateVipLevel('1', 2);

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1/vip',
        { vipLevel: 2 },
        'token123',
      );
      expect(result).toEqual(mockGuest);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.patch as jest.Mock).mockResolvedValue({});
      await guestsAPI.updateVipLevel('1', 1);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1/vip',
        { vipLevel: 1 },
        undefined,
      );
    });
  });

  describe('toggleBlacklist', () => {
    it('should call apiClient.patch with empty body', async () => {
      const mockGuest = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        vipLevel: 1,
        isBlacklist: true,
        totalStays: 0,
        totalRevenue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestsAPI.toggleBlacklist('1');

      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1/blacklist',
        {},
        'token123',
      );
      expect(result).toEqual(mockGuest);
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.patch as jest.Mock).mockResolvedValue({});
      await guestsAPI.toggleBlacklist('1');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1/blacklist',
        {},
        undefined,
      );
    });
  });

  describe('delete', () => {
    it('should call apiClient.delete with correct id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await guestsAPI.delete('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/guests/1', 'token123');
    });

    it('should handle missing auth token', async () => {
      (getAuthToken as jest.Mock).mockReturnValue(null);
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);
      await guestsAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/guests/1', undefined);
    });
  });
});
