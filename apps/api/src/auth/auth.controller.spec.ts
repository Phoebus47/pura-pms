import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return result from AuthService.login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const expectedResult = {
        access_token: 'token',
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'ADMIN',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResult);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should propagate error from AuthService.login', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const error = new Error('Unauthorized');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should be instantiated explicitly', () => {
      const explicitController = new AuthController(
        mockAuthService as unknown as AuthService,
      );
      expect(explicitController).toBeDefined();
    });

    it('should handle undefined DTO', async () => {
      mockAuthService.login.mockResolvedValue({});
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await controller.login(undefined as any);
      expect(mockAuthService.login).toHaveBeenCalledWith(undefined);
    });
  });
});
