import { Test, TestingModule } from '@nestjs/testing';
import { KioskController } from './kiosk.controller';
import { KioskService } from './kiosk.service';

const mockKioskService = {
  checkIn: vi.fn(),
};

describe('KioskController', () => {
  let controller: KioskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KioskController],
      providers: [{ provide: KioskService, useValue: mockKioskService }],
    }).compile();
    controller = module.get(KioskController);
    vi.clearAllMocks();
  });

  it('delegates check-in to kiosk service', async () => {
    mockKioskService.checkIn.mockResolvedValue({ id: 'res-1' });

    await controller.checkIn({
      confirmNumber: 'CN-123',
      propertyId: 'prop-1',
    });

    expect(mockKioskService.checkIn).toHaveBeenCalledWith({
      confirmNumber: 'CN-123',
      propertyId: 'prop-1',
    });
  });
});
