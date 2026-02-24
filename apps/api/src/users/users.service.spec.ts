import { Test, TestingModule } from '@nestjs/testing';
import { vi, type Mock } from 'vitest';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockPrismaService = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
      roleId: 'role-1',
    };

    it('should create a user with hashed password', async () => {
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-1',
        ...createDto,
        password: 'hashedpassword',
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
          }),
        }),
      );
      // Verify that the password sent to prisma is NOT the plain text password

      const createCallArgs = (prisma.user.create as Mock).mock.calls[0][0];

      expect(createCallArgs.data.password).not.toBe('password');
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      });

      const result = await service.findOne('test@example.com');
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      const result = await service.findOne('unknown@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user-1' });
      const result = await service.findById('user-1');
      expect(result?.id).toBe('user-1');
    });
  });
});
