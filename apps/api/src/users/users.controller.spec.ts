import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new UsersController(
      mockUsersService as unknown as UsersService,
    );
    expect(explicitController).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const req = { user: { id: '1', email: 'test@example.com' } };
      // @ts-expect-error - Mocks don't need full User type
      const result = controller.getProfile(req);
      expect(result).toEqual(req.user);
    });
  });
});
