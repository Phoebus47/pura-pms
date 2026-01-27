import { prisma } from './test-setup';
import { TransactionType, TrxGroup, ReasonCategory } from '@prisma/client';

describe('Seed Data Validation', () => {
  describe('TransactionCodes', () => {
    it('should have required TransactionCodes', async () => {
      const requiredCodes = ['1000', '2000', '4000', '5000', '9000'];

      for (const code of requiredCodes) {
        const trxCode = await prisma.transactionCode.findUnique({
          where: { code },
        });

        expect(trxCode).toBeDefined();
        expect(trxCode?.code).toBe(code);
      }
    });

    it('should have Room Revenue code (1000)', async () => {
      const roomRevenue = await prisma.transactionCode.findUnique({
        where: { code: '1000' },
      });

      expect(roomRevenue).toBeDefined();
      expect(roomRevenue?.type).toBe(TransactionType.CHARGE);
      expect(roomRevenue?.group).toBe(TrxGroup.ROOM);
      expect(roomRevenue?.glAccountCode).toBeDefined();
    });

    it('should have Food & Beverage code (2000)', async () => {
      const fnb = await prisma.transactionCode.findUnique({
        where: { code: '2000' },
      });

      expect(fnb).toBeDefined();
      expect(fnb?.type).toBe(TransactionType.CHARGE);
      expect(fnb?.group).toBe(TrxGroup.FOOD);
    });

    it('should have VAT code (4000)', async () => {
      const vat = await prisma.transactionCode.findUnique({
        where: { code: '4000' },
      });

      expect(vat).toBeDefined();
      expect(vat?.type).toBe(TransactionType.CHARGE);
      expect(vat?.group).toBe(TrxGroup.TAX);
    });

    it('should have Cash Payment code (9000)', async () => {
      const cash = await prisma.transactionCode.findUnique({
        where: { code: '9000' },
      });

      expect(cash).toBeDefined();
      expect(cash?.type).toBe(TransactionType.PAYMENT);
    });

    it('should have all codes with GL account mapping', async () => {
      const codes = await prisma.transactionCode.findMany();

      codes.forEach((code) => {
        expect(code.glAccountCode).toBeDefined();
        expect(code.glAccountCode.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ReasonCodes', () => {
    it('should have VOID category codes', async () => {
      const voidCodes = await prisma.reasonCode.findMany({
        where: { category: ReasonCategory.VOID },
      });

      expect(voidCodes.length).toBeGreaterThan(0);
      voidCodes.forEach((code) => {
        expect(code.category).toBe(ReasonCategory.VOID);
        expect(code.isActive).toBe(true);
      });
    });

    it('should have DISCOUNT category codes', async () => {
      const discountCodes = await prisma.reasonCode.findMany({
        where: { category: ReasonCategory.DISCOUNT },
      });

      expect(discountCodes.length).toBeGreaterThan(0);
    });

    it('should have ADJUSTMENT category codes', async () => {
      const adjCodes = await prisma.reasonCode.findMany({
        where: { category: ReasonCategory.ADJUSTMENT },
      });

      expect(adjCodes.length).toBeGreaterThan(0);
    });

    it('should have unique codes', async () => {
      const codes = await prisma.reasonCode.findMany();
      const codeSet = new Set(codes.map((c) => c.code));

      expect(codeSet.size).toBe(codes.length);
    });
  });

  describe('GLAccounts', () => {
    it('should have Cash account (1000)', async () => {
      const cash = await prisma.gLAccount.findFirst({
        where: { code: '1000' },
      });

      expect(cash).toBeDefined();
      expect(cash?.type).toBe('ASSET');
    });

    it('should have Room Revenue account (4000)', async () => {
      const roomRev = await prisma.gLAccount.findFirst({
        where: { code: '4000' },
      });

      expect(roomRev).toBeDefined();
      expect(roomRev?.type).toBe('REVENUE');
    });

    it('should have F&B Revenue account (4100)', async () => {
      const fnbRev = await prisma.gLAccount.findFirst({
        where: { code: '4100' },
      });

      expect(fnbRev).toBeDefined();
      expect(fnbRev?.type).toBe('REVENUE');
    });

    it('should have USALI-compliant structure', async () => {
      const accounts = await prisma.gLAccount.findMany();

      const accountTypes = new Set(accounts.map((a) => a.type));
      expect(accountTypes.has('ASSET')).toBe(true);
      expect(accountTypes.has('LIABILITY')).toBe(true);
      expect(accountTypes.has('REVENUE')).toBe(true);
      expect(accountTypes.has('EXPENSE')).toBe(true);
    });

    it('should have unique codes', async () => {
      const accounts = await prisma.gLAccount.findMany();
      const codeSet = new Set(accounts.map((a) => a.code));

      expect(codeSet.size).toBe(accounts.length);
    });
  });
});
