import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalsService } from './journals.service';

const mockPrismaService = {
  property: { findUnique: vi.fn() },
  journalEntry: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
  folioTransaction: { findMany: vi.fn() },
  gLAccount: { findMany: vi.fn(), update: vi.fn() },
  $transaction: vi.fn(),
};

describe('JournalsService', () => {
  let service: JournalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JournalsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();
    service = module.get<JournalsService>(JournalsService);
    vi.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(
      async (cb: (tx: typeof mockPrismaService) => Promise<unknown>) =>
        cb(mockPrismaService),
    );
  });

  it('should return an existing journal for the same property, date, and source', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    const existing = { id: 'je-1', source: 'MANUAL' };
    mockPrismaService.journalEntry.findUnique.mockResolvedValue(existing);

    const result = await service.postForBusinessDate(
      'prop-1',
      '2026-08-14',
      'MANUAL',
    );

    expect(result).toEqual(existing);
    expect(mockPrismaService.journalEntry.create).not.toHaveBeenCalled();
  });

  it('should post a balanced journal from folio charges', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrismaService.journalEntry.findUnique.mockResolvedValue(null);
    mockPrismaService.folioTransaction.findMany.mockResolvedValue([
      {
        sign: 1,
        amountTotal: 100,
        trxCode: { type: 'CHARGE', glAccountCode: '4000-01' },
      },
    ]);
    mockPrismaService.gLAccount.findMany.mockResolvedValue([
      { id: 'gl-1100', code: '1100' },
      { id: 'gl-4000', code: '4000-01' },
    ]);
    const created = { id: 'je-new' };
    mockPrismaService.journalEntry.create.mockResolvedValue(created);
    mockPrismaService.gLAccount.update.mockResolvedValue({});

    const result = await service.postForBusinessDate(
      'prop-1',
      '2026-08-14',
      'MANUAL',
      'user-1',
    );

    expect(result).toEqual(created);
    expect(mockPrismaService.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          source: 'MANUAL',
          isPosted: true,
          postedBy: 'user-1',
        }),
      }),
    );
  });

  it('should reject a missing property', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue(null);
    await expect(
      service.postForBusinessDate('missing', '2026-08-14'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should reject when a GL account is not seeded', async () => {
    mockPrismaService.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    mockPrismaService.journalEntry.findUnique.mockResolvedValue(null);
    mockPrismaService.folioTransaction.findMany.mockResolvedValue([
      {
        sign: 1,
        amountTotal: 100,
        trxCode: { type: 'CHARGE', glAccountCode: '4000-01' },
      },
    ]);
    mockPrismaService.gLAccount.findMany.mockResolvedValue([
      { id: 'gl-1100', code: '1100' },
    ]);

    await expect(
      service.postForBusinessDate('prop-1', '2026-08-14'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
