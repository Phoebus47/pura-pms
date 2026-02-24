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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startAudit', () => {
    it('should add a process-audit job to the queue', async () => {
      const businessDate = new Date('2025-01-15');
      mockQueue.add.mockResolvedValue({});

      const result = await service.startAudit('prop-1', businessDate);

      expect(result).toEqual({
        status: 'STARTED',
        message: 'Night audit job queued',
      });
      expect(mockQueue.add).toHaveBeenCalledWith('process-audit', {
        propertyId: 'prop-1',
        businessDate,
      });
    });
  });

  describe('processRoomPosting', () => {
    const businessDate = new Date('2025-01-15');

    it('should post room charges for checked-in reservations', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          roomRate: 3500,
          folios: [
            {
              id: 'folio-1',
              windows: [{ windowNumber: 1 }, { windowNumber: 2 }],
            },
          ],
          room: { id: 'room-1' },
        },
      ];

      mockPrismaService.reservation.findMany.mockResolvedValue(
        mockReservations,
      );
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
        group: 'ROOM',
        type: 'CHARGE',
      });
      mockFoliosService.postTransaction.mockResolvedValue({});

      await service.processRoomPosting('prop-1', businessDate);

      expect(mockFoliosService.postTransaction).toHaveBeenCalledWith(
        'folio-1',
        expect.objectContaining({
          windowNumber: 1,
          trxCodeId: 'trx-room',
          amountNet: 3500,
          userId: 'SYSTEM',
        }),
      );
    });

    it('should skip reservations without folios', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomRate: 1000,
          folios: [],
          room: { id: 'room-1' },
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });

      await service.processRoomPosting('prop-1', businessDate);

      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });

    it('should skip folios without window 1', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomRate: 1000,
          folios: [
            {
              id: 'folio-1',
              windows: [{ windowNumber: 2 }],
            },
          ],
          room: { id: 'room-1' },
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue({
        id: 'trx-room',
      });

      await service.processRoomPosting('prop-1', businessDate);

      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });

    it('should skip if ROOM trxCode not found', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([
        {
          id: 'res-1',
          roomRate: 1000,
          folios: [
            {
              id: 'folio-1',
              windows: [{ windowNumber: 1 }],
            },
          ],
          room: { id: 'room-1' },
        },
      ]);
      mockPrismaService.transactionCode.findFirst.mockResolvedValue(null);

      await service.processRoomPosting('prop-1', businessDate);

      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });

    it('should handle no checked-in reservations', async () => {
      mockPrismaService.reservation.findMany.mockResolvedValue([]);

      await service.processRoomPosting('prop-1', businessDate);

      expect(mockFoliosService.postTransaction).not.toHaveBeenCalled();
    });
  });

  describe('rollBusinessDate', () => {
    it('should log the business date roll', () => {
      // rollBusinessDate is synchronous, just logs
      expect(() => service.rollBusinessDate('prop-1')).not.toThrow();
    });
  });
});
