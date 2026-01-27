import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate and return payload', () => {
    const payload = { sub: '1', email: 'test@example.com', role: 'ADMIN' };
    const result = strategy.validate(payload);
    expect(result).toEqual({
      userId: '1',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  describe('JwtStrategy Default Secret', () => {
    let defaultStrategy: JwtStrategy;
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtStrategy,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue(undefined),
            },
          },
        ],
      }).compile();

      defaultStrategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined with default secret', () => {
      expect(defaultStrategy).toBeDefined();
    });
  });
});
