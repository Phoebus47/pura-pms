import { Test, TestingModule } from '@nestjs/testing';
import { PortalController } from './portal.controller';
import { PortalService } from './portal.service';

const mockPortalService = {
  getReservationSummary: vi.fn(),
  getFolioSummary: vi.fn(),
  createServiceRequest: vi.fn(),
};

describe('PortalController', () => {
  let controller: PortalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortalController],
      providers: [{ provide: PortalService, useValue: mockPortalService }],
    }).compile();
    controller = module.get(PortalController);
    vi.clearAllMocks();
  });

  it('delegates reservation lookup to the service', async () => {
    mockPortalService.getReservationSummary.mockResolvedValue({ id: 'res-1' });

    await controller.getReservation('CN-123', { lastName: 'Smith' });

    expect(mockPortalService.getReservationSummary).toHaveBeenCalledWith(
      'CN-123',
      'Smith',
    );
  });

  it('delegates folio lookup to the service', async () => {
    mockPortalService.getFolioSummary.mockResolvedValue([]);

    await controller.getFolio('CN-123', { lastName: 'Smith' });

    expect(mockPortalService.getFolioSummary).toHaveBeenCalledWith(
      'CN-123',
      'Smith',
    );
  });

  it('delegates message creation to the service', async () => {
    mockPortalService.createServiceRequest.mockResolvedValue({ id: 'msg-1' });

    await controller.createMessage('CN-123', {
      lastName: 'Smith',
      content: 'Extra towels please',
    });

    expect(mockPortalService.createServiceRequest).toHaveBeenCalledWith(
      'CN-123',
      { lastName: 'Smith', content: 'Extra towels please' },
    );
  });
});
