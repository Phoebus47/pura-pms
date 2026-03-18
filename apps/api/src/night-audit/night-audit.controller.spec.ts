import { Test, TestingModule } from '@nestjs/testing';
import { NightAuditController } from './night-audit.controller';
import { NightAuditService } from './night-audit.service';
import { StartAuditDto } from './dto/start-audit.dto';

const mockNightAuditService = {
  startAudit: vi.fn(),
  getAuditStatus: vi.fn(),
};

describe('NightAuditController', () => {
  let controller: NightAuditController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NightAuditController],
      providers: [
        {
          provide: NightAuditService,
          useValue: mockNightAuditService,
        },
      ],
    }).compile();

    controller = module.get<NightAuditController>(NightAuditController);
    vi.clearAllMocks();
  });

  describe('runAudit', () => {
    it('should call startAudit with propertyId and businessDate', async () => {
      mockNightAuditService.startAudit.mockResolvedValue({ status: 'STARTED' });
      const dto: StartAuditDto = {
        propertyId: 'prop-1',
        businessDate: '2025-01-15T00:00:00.000Z',
      };

      const result = await controller.runAudit(dto);

      expect(mockNightAuditService.startAudit).toHaveBeenCalledWith(
        'prop-1',
        new Date('2025-01-15T00:00:00.000Z'),
      );
      expect(result).toEqual({ status: 'STARTED' });
    });
  });

  describe('getStatus', () => {
    it('should call getAuditStatus with correct parameters', async () => {
      const mockStatus = { id: 'audit-1', status: 'IN_PROGRESS' };
      mockNightAuditService.getAuditStatus.mockResolvedValue(mockStatus);

      const result = await controller.getStatus(
        'prop-1',
        '2025-01-15T00:00:00.000Z',
      );

      expect(mockNightAuditService.getAuditStatus).toHaveBeenCalledWith(
        'prop-1',
        new Date('2025-01-15T00:00:00.000Z'),
      );
      expect(result).toEqual(mockStatus);
    });
  });
});
