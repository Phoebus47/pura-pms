import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prisma: { $queryRaw: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = { $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]) };
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  it('should return ok when the database responds', async () => {
    await expect(appController.getHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('should return unhealthy when the database is down', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('paused'));

    await expect(appController.getHealth()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('should be instantiated explicitly', () => {
    const explicitController = new AppController(
      new AppService(),
      prisma as unknown as PrismaService,
    );
    expect(explicitController).toBeDefined();
  });
});
