import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect on module init', async () => {
    vi.spyOn(service, '$connect').mockImplementation(async () => {});
    await service.onModuleInit();

    expect(service.$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    vi.spyOn(service, '$disconnect').mockImplementation(async () => {});
    await service.onModuleDestroy();

    expect(service.$disconnect).toHaveBeenCalled();
  });
});
