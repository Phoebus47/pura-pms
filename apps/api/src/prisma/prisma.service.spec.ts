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
    jest.spyOn(service, '$connect').mockImplementation(async () => {});
    await service.onModuleInit();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should disconnect on module destroy', async () => {
    jest.spyOn(service, '$disconnect').mockImplementation(async () => {});
    await service.onModuleDestroy();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.$disconnect).toHaveBeenCalled();
  });
});
