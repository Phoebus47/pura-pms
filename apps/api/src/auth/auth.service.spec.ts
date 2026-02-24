import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { vi } from 'vitest';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

const mockUsersService = {
  findOne: vi.fn(),
};

const mockJwtService = {
  sign: vi.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if validation successful', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      (
        mockUsersService.findOne as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(user);
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ id: 'user-1', email: 'test@example.com' });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedpassword',
      };
      (
        mockUsersService.findOne as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(user);
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        false,
      );

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password' };
    const user = {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'hashedpassword',
      isActive: true,
      role: { name: 'ADMIN' },
    };

    it('should return access_token and user info', async () => {
      (
        mockUsersService.findOne as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(user);
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );
      (
        mockJwtService.sign as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe('ADMIN');
    });

    it('should throw UnauthorizedException if credentials invalid', async () => {
      expect.assertions(2);
      (
        mockUsersService.findOne as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(true).toBe(true);
    });

    it('should throw UnauthorizedException if user inactive', async () => {
      expect.assertions(2);
      (
        mockUsersService.findOne as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        ...user,
        isActive: false,
      });
      (bcrypt.compare as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        true,
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(true).toBe(true);
    });
  });
});
