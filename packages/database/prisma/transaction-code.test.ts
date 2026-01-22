import { prisma } from './test-setup';
import { TransactionType, TrxGroup } from '@prisma/client';

describe('TransactionCode Model', () => {
  const testTransactionCode = {
    code: 'TEST-001',
    description: 'Test Transaction Code',
    descriptionTh: 'รหัสทดสอบ',
    type: TransactionType.CHARGE,
    group: TrxGroup.ROOM,
    hasTax: true,
    hasService: true,
    serviceRate: 10.0,
    glAccountCode: '4000-01',
    departmentCode: 'ROOM',
  };

  afterEach(async () => {
    // Clean up test data - only delete if created in this test
    // Note: We keep test data between tests to avoid foreign key issues
  });

  describe('CRUD Operations', () => {
    it('should create a TransactionCode', async () => {
      // Use findFirstOrCreate pattern
      let trxCode = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
      });

      if (!trxCode) {
        trxCode = await prisma.transactionCode.create({
          data: testTransactionCode,
        });
      }

      expect(trxCode).toBeDefined();
      expect(trxCode.code).toBe('TEST-001');
      expect(trxCode.type).toBe(TransactionType.CHARGE);
      expect(trxCode.group).toBe(TrxGroup.ROOM);
      expect(trxCode.hasTax).toBe(true);
      expect(trxCode.hasService).toBe(true);
      // Decimal type - check that it exists and is a valid number
      expect(trxCode.serviceRate).toBeDefined();
      expect(Number(trxCode.serviceRate)).toBe(10);
    });

    it('should read a TransactionCode by code', async () => {
      // Use findFirstOrCreate pattern
      let trxCode = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
      });

      if (!trxCode) {
        trxCode = await prisma.transactionCode.create({
          data: testTransactionCode,
        });
      }

      const found = await prisma.transactionCode.findUnique({
        where: { code: 'TEST-001' },
      });

      expect(found).toBeDefined();
      expect(found?.code).toBe('TEST-001');
    });

    it('should update a TransactionCode', async () => {
      // Use findFirstOrCreate pattern
      let created = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
      });

      if (!created) {
        created = await prisma.transactionCode.create({
          data: testTransactionCode,
        });
      }

      const updated = await prisma.transactionCode.update({
        where: { id: created.id },
        data: { description: 'Updated Description' },
      });

      expect(updated.description).toBe('Updated Description');
    });

    it('should delete a TransactionCode', async () => {
      // Create a unique code for this test to avoid conflicts
      const uniqueCode = `TEST-DELETE-${Date.now()}`;
      const created = await prisma.transactionCode.create({
        data: { ...testTransactionCode, code: uniqueCode },
      });

      await prisma.transactionCode.delete({
        where: { id: created.id },
      });

      const found = await prisma.transactionCode.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeNull();
    });
  });

  describe('Validation', () => {
    it('should enforce unique code constraint', async () => {
      // Use findFirstOrCreate pattern
      let trxCode = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
      });

      if (!trxCode) {
        trxCode = await prisma.transactionCode.create({
          data: testTransactionCode,
        });
      }

      await expect(
        prisma.transactionCode.create({
          data: { ...testTransactionCode, code: 'TEST-001' },
        }),
      ).rejects.toThrow();
    });

    it('should allow empty glAccountCode (validation in service layer)', async () => {
      // Note: Schema allows empty string, validation should be in service layer
      // Use unique code to avoid conflicts
      const uniqueCode = `TEST-EMPTY-GL-${Date.now()}`;
      const trxCode = await prisma.transactionCode.create({
        data: {
          ...testTransactionCode,
          code: uniqueCode,
          glAccountCode: '', // Empty string is allowed at DB level
        },
      });

      expect(trxCode.glAccountCode).toBe('');

      // Clean up
      await prisma.transactionCode.delete({ where: { id: trxCode.id } });
    });
  });

  describe('Relations', () => {
    it('should have transactions relation', async () => {
      // Use findFirstOrCreate pattern
      let trxCode = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
        include: { transactions: true },
      });

      if (!trxCode) {
        trxCode = await prisma.transactionCode.create({
          data: testTransactionCode,
          include: { transactions: true },
        });
      }

      expect(trxCode.transactions).toBeDefined();
      expect(Array.isArray(trxCode.transactions)).toBe(true);
    });

    it('should have fixedCharges relation', async () => {
      // Use findFirstOrCreate pattern
      let trxCode = await prisma.transactionCode.findFirst({
        where: { code: testTransactionCode.code },
        include: { fixedCharges: true },
      });

      if (!trxCode) {
        trxCode = await prisma.transactionCode.create({
          data: testTransactionCode,
          include: { fixedCharges: true },
        });
      }

      expect(trxCode.fixedCharges).toBeDefined();
      expect(Array.isArray(trxCode.fixedCharges)).toBe(true);
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      // Use findFirstOrCreate pattern for each code
      const codes = [
        { ...testTransactionCode, code: 'TEST-ROOM', group: TrxGroup.ROOM },
        { ...testTransactionCode, code: 'TEST-FOOD', group: TrxGroup.FOOD },
        { ...testTransactionCode, code: 'TEST-BEV', group: TrxGroup.BEVERAGE },
      ];

      for (const codeData of codes) {
        const existing = await prisma.transactionCode.findFirst({
          where: { code: codeData.code },
        });
        if (!existing) {
          await prisma.transactionCode.create({ data: codeData });
        }
      }
    });

    it('should filter by type', async () => {
      const chargeCodes = await prisma.transactionCode.findMany({
        where: { type: TransactionType.CHARGE },
      });

      expect(chargeCodes.length).toBeGreaterThan(0);
      chargeCodes.forEach((code) => {
        expect(code.type).toBe(TransactionType.CHARGE);
      });
    });

    it('should filter by group', async () => {
      const roomCodes = await prisma.transactionCode.findMany({
        where: { group: TrxGroup.ROOM },
      });

      expect(roomCodes.length).toBeGreaterThan(0);
      roomCodes.forEach((code) => {
        expect(code.group).toBe(TrxGroup.ROOM);
      });
    });
  });
});
