import { Test, TestingModule } from '@nestjs/testing';
import { NightAuditService } from './night-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { FoliosService } from '../folios/folios.service';
import { getQueueToken } from '@nestjs/bullmq';

const mockPrismaService = {
  reservation: {
    findMany: vi.fn(),
  },
  transactionCode: {
    findFirst: vi.fn(),
  },
  nightAudit: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
  property: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  folioTransaction: {
    findFirst: vi.fn(),
  },
  auditError: {
    create: vi.fn(),
  },
  reportArchive: {
    create: vi.fn(),
  },
};

const mockFoliosService = {
  postTransaction: vi.fn(),
};

const mockQueue = {
  add: vi.fn(),
};

describe('NightAuditService', () => {
  let service: NightAuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NightAuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: FoliosService,
          useValue: mockFoliosService,
        },
        {
          provide: getQueueToken('night-audit'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<NightAuditService>(NightAuditService);

    vi.clearAllMocks();
  });

  describe('startAudit', () => {
    it('should create an audit record and queue the job', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue(null);
      mockPrismaService.nightAudit.upsert.mockResolvedValue({ id: 'audit-1' });
      mockQueue.add.mockResolvedValue({});

      const result = await service.startAudit('prop-1', businessDate);

      expect(result.status).toBe('STARTED');
      expect(mockPrismaService.nightAudit.upsert).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-audit',
        expect.objectContaining({
          propertyId: 'prop-1',
          auditId: 'audit-1',
        }),
        expect.objectContaining({
          jobId: expect.stringContaining('night-audit:prop-1:2025-01-15'),
        }),
      );
    });

    it('should block if already completed', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue({
        status: 'COMPLETED',
      });

      const result = await service.startAudit('prop-1', businessDate);

      expect(result.status).toBe('ALREADY_COMPLETED');
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should not enqueue when already in progress', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue({
        id: 'audit-in-progress',
        status: 'IN_PROGRESS',
      });

      const result = await service.startAudit('prop-1', businessDate);

      expect(result.status).toBe('ALREADY_IN_PROGRESS');
      expect(result.nightAuditId).toBe('audit-in-progress');
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('processRoomPosting', () => {
    const businessDate = new Date('2025-01-15');

    it('should post room charges with idempotency', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomRate: 3500,
          folios: [
            { id: 'folio-1', windows: [{ id: 'win-1', windowNumber: 1 }] },
          ],
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });
      mockPrismaService.folioTransaction.findFirst.mockResolvedValue(null); // No existing posting
      mockFoliosService.postTransaction.mockResolvedValue({});
      mockPrismaService.nightAudit.update.mockResolvedValue({});

      const result = await service.processRoomPosting('prop-1', businessDate);

      expect(result.roomsPosted).toBe(1);
      expect(mockFoliosService.postTransaction).toHaveBeenCalled();
    });

    it('should skip if already posted (idempotency)', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomRate: 3500,
          folios: [
            { id: 'folio-1', windows: [{ id: 'win-1', windowNumber: 1 }] },
          ],
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });
      mockPrismaService.folioTransaction.findFirst.mockResolvedValue({
        id: 'existing-trx',
      }); // Already posted
      mockPrismaService.nightAudit.update.mockResolvedValue({});

      const result = await service.processRoomPosting('prop-1', businessDate);

      expect(result.roomsPosted).toBe(0);
      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });

    it('should throw an error if ROOM transaction code is not found', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue(null);

      await expect(
        service.processRoomPosting('prop-1', businessDate),
      ).rejects.toThrow('Critical: ROOM transaction code missing');
    });

    it('should skip reservations that have no folios', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-no-folio',
          roomRate: 3500,
          folios: [], // Missing folio
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });
      mockPrismaService.nightAudit.update.mockResolvedValue({});

      const result = await service.processRoomPosting('prop-1', businessDate);

      expect(result.roomsPosted).toBe(0);
      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });

    it('should skip reservations that have folios but no valid windows', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-no-window',
          roomRate: 3500,
          folios: [{ id: 'folio-1', windows: [] }], // Missing window Number 1
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });
      mockPrismaService.nightAudit.update.mockResolvedValue({});

      const result = await service.processRoomPosting('prop-1', businessDate);

      expect(result.roomsPosted).toBe(0);
      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });
  });

  describe('rollBusinessDate', () => {
    it('should increment the property business date', async () => {
      const initialDate = new Date('2025-01-15');
      mockPrismaService.property.findUnique.mockResolvedValue({
        businessDate: initialDate,
      });
      mockPrismaService.property.update.mockResolvedValue({});

      const nextDate = await service.rollBusinessDate('prop-1');

      expect(nextDate.getDate()).toBe(16);
      expect(mockPrismaService.property.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { businessDate: expect.any(Date) },
      });
    });

    it('should throw an error if property is not found', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue(null);
      await expect(service.rollBusinessDate('prop-invalid')).rejects.toThrow(
        'Property prop-invalid not found',
      );
    });
  });

  describe('getAuditStatus', () => {
    it('should retrieve the audit status for a given property and date', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue({
        status: 'IN_PROGRESS',
      });

      const status = await service.getAuditStatus('prop-1', businessDate);

      expect(status.status).toBe('IN_PROGRESS');
      expect(mockPrismaService.nightAudit.findUnique).toHaveBeenCalled();
    });

    it('should return NOT_STARTED if audit record does not exist', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue(null);

      const status = await service.getAuditStatus('prop-1', businessDate);

      expect(status.status).toBe('NOT_STARTED');
    });
  });

  describe('completeAudit', () => {
    it('should update the audit status to COMPLETED and set completedAt', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.update.mockResolvedValue({});
      mockPrismaService.property.findUnique.mockResolvedValue({ businessDate });
      mockPrismaService.property.update.mockResolvedValue({});

      await service.completeAudit('prop-1', businessDate);

      expect(mockPrismaService.nightAudit.update).toHaveBeenCalledWith({
        where: {
          propertyId_businessDate: { propertyId: 'prop-1', businessDate },
        },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        },
      });
    });
  });

  describe('recordAuditError', () => {
    it('should create an AuditError and update status to FAILED', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue({
        id: 'audit-1',
      });
      mockPrismaService.auditError.create.mockResolvedValue({});
      mockPrismaService.nightAudit.update.mockResolvedValue({});

      await service.recordAuditError('prop-1', businessDate, {
        errorType: 'ROOM_POSTING_FAILED',
        description: 'Some error',
      });

      expect(mockPrismaService.auditError.create).toHaveBeenCalledWith({
        data: {
          nightAuditId: 'audit-1',
          errorType: 'ROOM_POSTING_FAILED',
          description: 'Some error',
        },
      });
      expect(mockPrismaService.nightAudit.update).toHaveBeenCalledWith({
        where: { id: 'audit-1' },
        data: { status: 'FAILED' },
      });
    });

    it('should not throw if audit record is not found', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.nightAudit.findUnique.mockResolvedValue(null);

      await expect(
        service.recordAuditError('prop-1', businessDate, {
          errorType: 'ERR',
          description: 'desc',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('generateNightAuditReport', () => {
    it('should create a ReportArchive link', async () => {
      const businessDate = new Date('2025-01-15');
      mockPrismaService.reportArchive.create.mockResolvedValue({});

      await service.generateNightAuditReport(
        'prop-1',
        'audit-1',
        businessDate,
        {
          total: 100,
        },
      );

      expect(mockPrismaService.reportArchive.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reportType: 'NIGHT_AUDIT_SUMMARY',
          propertyId: 'prop-1',
          nightAuditId: 'audit-1',
          businessDate,
        }),
      });
    });
  });
});
