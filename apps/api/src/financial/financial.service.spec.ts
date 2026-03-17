import { Test, TestingModule } from '@nestjs/testing';
import { FinancialService } from './financial.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@pura/database';

const mockPrismaService = {
  transactionCode: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  reasonCode: {
    findMany: vi.fn(),
  },
};

describe('FinancialService', () => {
  let service: FinancialService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FinancialService>(FinancialService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllTransactionCodes', () => {
    it('should return all transaction codes ordered by code', async () => {
      const mockCodes = [
        { id: '1', code: 'CASH', type: 'PAYMENT' },
        { id: '2', code: 'ROOM', type: 'CHARGE' },
      ];
      mockPrismaService.transactionCode.findMany.mockResolvedValue(mockCodes);

      const result = await service.findAllTransactionCodes();

      expect(result).toEqual(mockCodes);
      expect(prisma.transactionCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { code: 'asc' },
        }),
      );
    });
  });

  describe('findTransactionCodeById', () => {
    it('should return transaction code when found', async () => {
      const mockCode = { id: 'tc-1', code: '1000' };
      mockPrismaService.transactionCode.findUnique.mockResolvedValue(mockCode);

      const result = await service.findTransactionCodeById('tc-1');

      expect(result).toEqual(mockCode);
      expect(prisma.transactionCode.findUnique).toHaveBeenCalledWith({
        where: { id: 'tc-1' },
      });
    });

    it('should throw when not found', async () => {
      mockPrismaService.transactionCode.findUnique.mockResolvedValue(null);

      await expect(service.findTransactionCodeById('missing')).rejects.toThrow(
        'Transaction code not found',
      );
    });
  });

  describe('createTransactionCode', () => {
    it('should create transaction code', async () => {
      const dto = {
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      };
      const created = { id: 'tc-1', ...dto };
      mockPrismaService.transactionCode.create.mockResolvedValue(created);

      const result = await service.createTransactionCode(dto as never);

      expect(result).toEqual(created);
      expect(prisma.transactionCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            code: '1000',
            description: 'Room Charge',
            glAccountCode: '4000-01',
          }),
        }),
      );
    });

    it('should throw conflict on duplicate code', async () => {
      const dto = {
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      };
      mockPrismaService.transactionCode.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(service.createTransactionCode(dto as never)).rejects.toThrow(
        'Transaction code already exists',
      );
    });

    it('should rethrow prisma errors with non-duplicate codes', async () => {
      const dto = {
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      };
      mockPrismaService.transactionCode.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('fk', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      await expect(service.createTransactionCode(dto as never)).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );
    });

    it('should rethrow non-prisma errors', async () => {
      const dto = {
        code: '1000',
        description: 'Room Charge',
        type: 'CHARGE',
        group: 'ROOM',
        hasTax: true,
        hasService: true,
        serviceRate: 10,
        glAccountCode: '4000-01',
      };
      mockPrismaService.transactionCode.create.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.createTransactionCode(dto as never)).rejects.toThrow(
        'unexpected',
      );
    });

    it('should throw when required fields are missing', async () => {
      await expect(
        service.createTransactionCode({ code: '1000' } as never),
      ).rejects.toThrow('Invalid transaction code data');
    });

    it.each([
      ['code', { description: 'x' }],
      ['description', { code: '1000' }],
      ['type', { code: '1000', description: 'x' }],
      ['group', { code: '1000', description: 'x', type: 'CHARGE' }],
      [
        'hasTax',
        { code: '1000', description: 'x', type: 'CHARGE', group: 'ROOM' },
      ],
      [
        'hasService',
        {
          code: '1000',
          description: 'x',
          type: 'CHARGE',
          group: 'ROOM',
          hasTax: true,
        },
      ],
      [
        'glAccountCode',
        {
          code: '1000',
          description: 'x',
          type: 'CHARGE',
          group: 'ROOM',
          hasTax: true,
          hasService: true,
        },
      ],
    ])('should reject when %s is missing', async (_field, partial) => {
      await expect(
        service.createTransactionCode(partial as never),
      ).rejects.toThrow('Invalid transaction code data');
    });
  });

  describe('updateTransactionCode', () => {
    it('should update transaction code', async () => {
      const updated = { id: 'tc-1', code: '1000', description: 'Updated' };
      mockPrismaService.transactionCode.update.mockResolvedValue(updated);

      const result = await service.updateTransactionCode('tc-1', {
        description: 'Updated',
      } as never);

      expect(result).toEqual(updated);
      expect(prisma.transactionCode.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tc-1' },
          data: { description: 'Updated' },
        }),
      );
    });

    it('should throw not found on missing id', async () => {
      mockPrismaService.transactionCode.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('missing', {
          code: 'P2025',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.updateTransactionCode('missing', { description: 'x' } as never),
      ).rejects.toThrow('Transaction code not found');
    });

    it('should throw conflict on duplicate code', async () => {
      mockPrismaService.transactionCode.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.updateTransactionCode('tc-1', { code: 'DUP' } as never),
      ).rejects.toThrow('Transaction code already exists');
    });

    it('should rethrow prisma errors with unhandled codes', async () => {
      mockPrismaService.transactionCode.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('other', {
          code: 'P2003',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.updateTransactionCode('tc-1', { description: 'x' } as never),
      ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
    });

    it('should rethrow non-prisma errors', async () => {
      mockPrismaService.transactionCode.update.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(
        service.updateTransactionCode('tc-1', { description: 'x' } as never),
      ).rejects.toThrow('unexpected');
    });
  });

  describe('findAllReasonCodes', () => {
    it('should return active reason codes ordered by code', async () => {
      const mockCodes = [{ id: '1', code: 'ADJ', isActive: true }];
      mockPrismaService.reasonCode.findMany.mockResolvedValue(mockCodes);

      const result = await service.findAllReasonCodes();

      expect(result).toEqual(mockCodes);
      expect(prisma.reasonCode.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { code: 'asc' },
        }),
      );
    });
  });
});
