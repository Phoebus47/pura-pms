import { NightAuditProcessor } from './night-audit.processor';
import { NightAuditService } from './night-audit.service';
import { Job } from 'bullmq';

const mockNightAuditService = {
  processRoomPosting: vi.fn(),
  rollBusinessDate: vi.fn(),
  generateNightAuditReport: vi.fn(),
  completeAudit: vi.fn(),
  recordAuditError: vi.fn(),
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
    it('should process a process-audit job successfully', async () => {
      const mockJob = {
        name: 'process-audit',
        data: {
          propertyId: 'prop-1',
          businessDate: '2025-01-15T00:00:00.000Z',
          auditId: 'audit-1',
        },
      } as unknown as Job<{
        propertyId: string;
        businessDate: string;
        auditId: string;
      }>;

      mockNightAuditService.processRoomPosting.mockResolvedValue({
        roomsPosted: 5,
        totalRevenue: 5000,
      });
      mockNightAuditService.generateNightAuditReport.mockResolvedValue({});
      mockNightAuditService.completeAudit.mockResolvedValue(new Date());

      const result = await processor.process(mockJob);

      expect(result).toEqual({ status: 'COMPLETED' });
      expect(mockNightAuditService.processRoomPosting).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
      );
      expect(
        mockNightAuditService.generateNightAuditReport,
      ).toHaveBeenCalledWith(
        'prop-1',
        'audit-1',
        expect.any(Date),
        expect.any(Object),
      );
      expect(mockNightAuditService.completeAudit).toHaveBeenCalled();
    });

    it('should handle errors and record audit error', async () => {
      const mockJob = {
        name: 'process-audit',
        data: {
          propertyId: 'prop-1',
          businessDate: '2025-01-15T00:00:00.000Z',
          auditId: 'audit-1',
        },
      } as unknown as Job<{
        propertyId: string;
        businessDate: string;
        auditId: string;
      }>;

      const error = new Error('Posting failed');
      mockNightAuditService.processRoomPosting.mockRejectedValue(error);

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Posting failed',
      );

      expect(mockNightAuditService.recordAuditError).toHaveBeenCalledWith(
        'prop-1',
        expect.any(Date),
        expect.objectContaining({
          errorType: 'PROCESSOR_FAILURE',
          description: 'Posting failed',
        }),
      );
    });

    it('should throw for unknown job name', async () => {
      const mockJob = {
        name: 'unknown-job',
        data: {
          propertyId: 'prop-1',
          businessDate: '2025-01-15',
          auditId: 'audit-1',
        },
      } as unknown as Job<{
        propertyId: string;
        businessDate: string;
        auditId: string;
      }>;

      await expect(processor.process(mockJob)).rejects.toThrow(
        'Unknown job name: unknown-job',
      );
    });
  });
});
