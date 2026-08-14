import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { PrismaService } from '../prisma/prisma.service';

const businessDate = new Date('2026-08-14T00:00:00.000Z');

const mockPrismaService = {
  property: { findUnique: vi.fn() },
  shift: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  folioTransaction: { findMany: vi.fn() },
  user: { findUnique: vi.fn() },
  $transaction: vi.fn(),
};

function openShift(overrides: Record<string, unknown> = {}) {
  return {
    id: 'shift-1',
    shiftNumber: 'SH-20260814-prop01-1',
    userId: 'user-1',
    propertyId: 'prop-1',
    businessDate,
    startTime: new Date('2026-08-14T01:00:00.000Z'),
    endTime: null,
    openingCash: 1000,
    closingCash: null,
    expectedCash: null,
    cashVariance: null,
    status: 'OPEN',
    closedBy: null,
    managerApprovedBy: null,
    managerApprovedAt: null,
    varianceReason: null,
    handoverToUserId: null,
    handoverFromShiftId: null,
    notes: null,
    ...overrides,
  };
}

describe('ShiftsService', () => {
  let service: ShiftsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShiftsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<ShiftsService>(ShiftsService);
    vi.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        cb(mockPrismaService),
    );
  });

  describe('open', () => {
    it('should open a shift on the property business date', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        businessDate,
      });
      mockPrismaService.shift.findFirst.mockResolvedValue(null);
      mockPrismaService.shift.count.mockResolvedValue(0);
      const created = openShift();
      mockPrismaService.shift.create.mockResolvedValue(created);

      const result = await service.open({
        propertyId: 'prop-1',
        userId: 'user-1',
        openingCash: 1000,
      });

      expect(result.status).toBe('OPEN');
      expect(result.openingCash).toBe(1000);
      expect(mockPrismaService.shift.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            propertyId: 'prop-1',
            userId: 'user-1',
            businessDate,
            status: 'OPEN',
            openingCash: 1000,
          }),
        }),
      );
    });

    it('should reject a second open shift for the same user', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        businessDate,
      });
      mockPrismaService.shift.findFirst.mockResolvedValue(openShift());

      await expect(
        service.open({
          propertyId: 'prop-1',
          userId: 'user-1',
          openingCash: 1000,
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.shift.create).not.toHaveBeenCalled();
    });

    it('should allow two different users to both be OPEN', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        businessDate,
      });
      mockPrismaService.shift.findFirst.mockResolvedValue(null);
      mockPrismaService.shift.count.mockResolvedValue(1);
      mockPrismaService.shift.create.mockResolvedValue(
        openShift({ id: 'shift-2', userId: 'user-2' }),
      );

      const result = await service.open({
        propertyId: 'prop-1',
        userId: 'user-2',
        openingCash: 500,
      });

      expect(result.userId).toBe('user-2');
      expect(mockPrismaService.shift.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-2', status: 'OPEN' },
        }),
      );
    });

    it('should reject optional businessDate that does not match property', async () => {
      mockPrismaService.property.findUnique.mockResolvedValue({
        id: 'prop-1',
        businessDate,
      });

      await expect(
        service.open({
          propertyId: 'prop-1',
          userId: 'user-1',
          openingCash: 1000,
          businessDate: '2026-08-13',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.shift.create).not.toHaveBeenCalled();
    });
  });

  describe('expected cash', () => {
    it('should increase expected cash for 9000 payment sign -1', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([
        {
          id: 'cash-in',
          amountTotal: 250,
          sign: -1,
          isVoid: false,
          trxCode: { code: '9000' },
        },
      ]);

      const result = await service.findOne('shift-1');
      expect(result.expectedCash).toBe(1250);
    });

    it('should ignore 1000 room charges when computing expected cash', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([
        {
          id: 'room',
          amountTotal: 3500,
          sign: 1,
          isVoid: false,
          trxCode: { code: '1000' },
        },
        {
          id: 'cash-in',
          amountTotal: 250,
          sign: -1,
          isVoid: false,
          trxCode: { code: '9000' },
        },
      ]);

      const result = await service.findOne('shift-1');
      expect(result.expectedCash).toBe(1250);
    });

    it('should reduce expected cash for void correction sign +1', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([
        {
          id: 'orig',
          amountTotal: 200,
          sign: -1,
          isVoid: true,
          trxCode: { code: '9000' },
        },
        {
          id: 'corr',
          amountTotal: 200,
          sign: 1,
          isVoid: false,
          trxCode: { code: '9000' },
        },
      ]);

      const result = await service.findOne('shift-1');
      expect(result.expectedCash).toBe(1000);
      expect(result.cashSummary.transactionCount).toBe(2);
    });
  });

  describe('close', () => {
    it('should persist expectedCash and set BALANCED when variance is 0', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);
      mockPrismaService.shift.update.mockResolvedValue(
        openShift({
          status: 'BALANCED',
          closingCash: 1000,
          expectedCash: 1000,
          cashVariance: 0,
          closedBy: 'user-1',
        }),
      );

      const result = await service.close('shift-1', {
        closingCash: 1000,
        userId: 'user-1',
      });

      expect(result.status).toBe('BALANCED');
      expect(mockPrismaService.shift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expectedCash: 1000,
            closingCash: 1000,
            cashVariance: 0,
            status: 'BALANCED',
            closedBy: 'user-1',
          }),
        }),
      );
    });

    it('should require varianceReason when variance is not zero', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);

      await expect(
        service.close('shift-1', { closingCash: 900, userId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.shift.update).not.toHaveBeenCalled();
    });

    it('should set CLOSED and persist expectedCash when variance is not zero', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);
      mockPrismaService.shift.update.mockResolvedValue(
        openShift({
          status: 'CLOSED',
          closingCash: 900,
          expectedCash: 1000,
          cashVariance: -100,
          varianceReason: 'Short drawer',
        }),
      );

      const result = await service.close('shift-1', {
        closingCash: 900,
        userId: 'user-1',
        varianceReason: 'Short drawer',
      });

      expect(result.status).toBe('CLOSED');
      expect(mockPrismaService.shift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expectedCash: 1000,
            status: 'CLOSED',
            varianceReason: 'Short drawer',
          }),
        }),
      );
    });

    it('should not close a shift twice', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(
        openShift({ status: 'BALANCED' }),
      );

      await expect(
        service.close('shift-1', { closingCash: 1000, userId: 'user-1' }),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.shift.update).not.toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('should approve a CLOSED shift to BALANCED', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(
        openShift({ status: 'CLOSED', userId: 'cashier-1' }),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'manager-1',
        role: { permissions: ['SHIFT_APPROVE'] },
      });
      mockPrismaService.shift.update.mockResolvedValue(
        openShift({
          status: 'BALANCED',
          managerApprovedBy: 'manager-1',
        }),
      );

      const result = await service.approve('shift-1', { userId: 'manager-1' });
      expect(result.status).toBe('BALANCED');
      expect(mockPrismaService.shift.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'BALANCED',
            managerApprovedBy: 'manager-1',
          }),
        }),
      );
    });

    it('should allow Super Admin to self-approve with ALL', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(
        openShift({ status: 'CLOSED', userId: 'admin-1' }),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: { permissions: ['ALL'] },
      });
      mockPrismaService.shift.update.mockResolvedValue(
        openShift({ status: 'BALANCED', userId: 'admin-1' }),
      );

      await service.approve('shift-1', { userId: 'admin-1' });
      expect(mockPrismaService.shift.update).toHaveBeenCalled();
    });

    it('should forbid staff from self-approving', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(
        openShift({ status: 'CLOSED', userId: 'user-1' }),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { permissions: ['SHIFT_APPROVE'] },
      });

      await expect(
        service.approve('shift-1', { userId: 'user-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid SHIFT_APPROVE without ALL from self-approving', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(
        openShift({ status: 'CLOSED', userId: 'user-1' }),
      );
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-1',
        role: { permissions: ['SHIFT_APPROVE'] },
      });

      await expect(
        service.approve('shift-1', { userId: 'user-1' }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockPrismaService.shift.update).not.toHaveBeenCalled();
    });
  });

  describe('handover', () => {
    it('should close current and open successor in one transaction', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.shift.findFirst.mockResolvedValue(null);
      mockPrismaService.folioTransaction.findMany.mockResolvedValue([]);
      mockPrismaService.shift.update.mockResolvedValue(
        openShift({
          status: 'BALANCED',
          closingCash: 1000,
          expectedCash: 1000,
          handoverToUserId: 'user-2',
        }),
      );
      mockPrismaService.shift.count.mockResolvedValue(1);
      mockPrismaService.shift.create.mockResolvedValue(
        openShift({
          id: 'shift-2',
          userId: 'user-2',
          handoverFromShiftId: 'shift-1',
          openingCash: 1000,
        }),
      );

      const result = await service.handover('shift-1', {
        toUserId: 'user-2',
        countedCash: 1000,
        userId: 'user-1',
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result.closed.handoverToUserId).toBe('user-2');
      expect(result.opened.handoverFromShiftId).toBe('shift-1');
      expect(mockPrismaService.shift.update).toHaveBeenCalled();
      expect(mockPrismaService.shift.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-2',
            openingCash: 1000,
            propertyId: 'prop-1',
            businessDate,
            handoverFromShiftId: 'shift-1',
          }),
        }),
      );
    });

    it('should reject handover when the target user already has OPEN', async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(openShift());
      mockPrismaService.shift.findFirst.mockResolvedValue(
        openShift({ id: 'shift-other', userId: 'user-2' }),
      );

      await expect(
        service.handover('shift-1', {
          toUserId: 'user-2',
          countedCash: 1000,
          userId: 'user-1',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.shift.create).not.toHaveBeenCalled();
    });
  });

  describe('findCurrent', () => {
    it('should 404 when the user has no OPEN shift', async () => {
      mockPrismaService.shift.findFirst.mockResolvedValue(null);
      await expect(service.findCurrent('prop-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
