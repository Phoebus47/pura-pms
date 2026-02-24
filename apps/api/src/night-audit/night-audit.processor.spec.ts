import { NightAuditProcessor } from './night-audit.processor';
import { NightAuditService } from './night-audit.service';
import { Job } from 'bullmq';

const mockNightAuditService = {
  processRoomPosting: vi.fn(),
  rollBusinessDate: vi.fn(),
};

describe('NightAuditProcessor', () => {
  let processor: NightAuditProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new NightAuditProcessor(
      mockNightAuditService as unknown as NightAuditService,
    );
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    it('should process a process-audit job', async () => {
      const mockJob = {
        name: 'process-audit',
        data: {
          propertyId: 'prop-1',
          businessDate: '2025-01-15',
        },
      } as unknown as Job<{ propertyId: string; businessDate: string }>;

      mockNightAuditService.processRoomPosting.mockResolvedValue(undefined);

      const result = await processor.process(mockJob);

      expect(result).toEqual({ status: 'COMPLETED' });
      expect(mockNightAuditService.processRoomPosting).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
      );
      expect(mockNightAuditService.rollBusinessDate).toHaveBeenCalledWith(
        'prop-1',
      );
    });

    it('should throw for unknown job name', async () => {
      const mockJob = {
        name: 'unknown-job',
        data: {
          propertyId: 'prop-1',
          businessDate: '2025-01-15',
        },
      } as unknown as Job<{ propertyId: string; businessDate: string }>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Unknown job name: unknown-job',
      );
    });
  });
});
