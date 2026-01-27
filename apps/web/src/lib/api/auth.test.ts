import { authAPI } from './auth';
import { apiClient } from './client';

jest.mock('./client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

describe('authAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call apiClient.post with correct parameters', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        access_token: 'token123',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'admin',
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authAPI.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('should call apiClient.get with correct parameters', async () => {
      const token = 'token123';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockUser);

      const result = await authAPI.getCurrentUser(token);

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me', token);
      expect(result).toEqual(mockUser);
    });
  });
});
