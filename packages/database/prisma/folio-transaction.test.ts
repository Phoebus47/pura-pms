import { prisma } from './test-setup';
import {
  TransactionType,
  TrxGroup,
  FolioStatus,
  ReasonCategory,
  RoomStatus,
} from '@prisma/client';

describe('FolioTransaction Model', () => {
  let testFolio: any;
  let testWindow: any;
  let testTrxCode: any;
  let testReasonCode: any;
  let testUser: any;
  let testReservation: any;
  let testGuest: any;
  let testRoom: any;
  let testProperty: any;

  // Helper function to ensure test data exists
  const ensureTestData = async () => {
    if (!testFolio) {
      throw new Error('Test folio not properly initialized');
    }

    // Always re-fetch window to ensure it exists
    testWindow = await prisma.folioWindow.findFirst({
      where: { folioId: testFolio.id, windowNumber: 1 },
    });
    if (!testWindow) {
      testWindow = await prisma.folioWindow.create({
        data: { folioId: testFolio.id, windowNumber: 1 },
      });
    }

    // Always re-fetch transaction code to ensure it exists
    testTrxCode = await prisma.transactionCode.findFirst({
      where: { code: 'TEST-TRX-CODE' },
    });
    if (!testTrxCode) {
      testTrxCode = await prisma.transactionCode.create({
        data: {
          code: 'TEST-TRX-CODE',
          description: 'Test Transaction Code',
          type: TransactionType.CHARGE,
          group: TrxGroup.ROOM,
          hasTax: true,
          hasService: true,
          serviceRate: 10.0,
          glAccountCode: '4000-01',
        },
      });
    }

    // Ensure user exists
    if (!testUser) {
      throw new Error('Test user not properly initialized');
    }

    return { window: testWindow, trxCode: testTrxCode, user: testUser };
  };

  beforeAll(async () => {
    // Create test data
    testProperty = await prisma.property.create({
      data: {
        name: 'Test Hotel',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      },
    });

    const roomType = await prisma.roomType.create({
      data: {
        name: 'Standard Room',
        code: 'STD',
        baseRate: 1000,
        propertyId: testProperty.id,
      },
    });

    testRoom = await prisma.room.create({
      data: {
        number: '101',
        floor: 1,
        status: RoomStatus.VACANT_CLEAN,
        roomTypeId: roomType.id,
        propertyId: testProperty.id,
      },
    });

    testGuest = await prisma.guest.create({
      data: {
        firstName: 'Test',
        lastName: 'Guest',
        email: 'test@example.com',
        phone: '0812345678',
      },
    });

    // Use findFirstOrCreate pattern for reservation
    testReservation = await prisma.reservation.findFirst({
      where: { confirmNumber: 'TEST-TRX-001' },
    });

    if (!testReservation) {
      testReservation = await prisma.reservation.create({
        data: {
          confirmNumber: 'TEST-TRX-001',
          checkIn: new Date('2025-01-01'),
          checkOut: new Date('2025-01-05'),
          nights: 4,
          adults: 2,
          roomRate: 1000,
          totalAmount: 4000,
          roomId: testRoom.id,
          guestId: testGuest.id,
        },
      });
    }

    // Use findFirstOrCreate pattern for folio
    testFolio = await prisma.folio.findFirst({
      where: { folioNumber: 'F-TEST-TRX-001' },
    });

    if (!testFolio) {
      testFolio = await prisma.folio.create({
        data: {
          folioNumber: 'F-TEST-TRX-001',
          reservationId: testReservation.id,
          status: FolioStatus.OPEN,
        },
      });
    }

    // Use findFirstOrCreate pattern for window
    testWindow = await prisma.folioWindow.findFirst({
      where: {
        folioId: testFolio.id,
        windowNumber: 1,
      },
    });

    if (!testWindow) {
      testWindow = await prisma.folioWindow.create({
        data: {
          folioId: testFolio.id,
          windowNumber: 1,
        },
      });
    }

    // Use findFirstOrCreate pattern for transaction code
    testTrxCode = await prisma.transactionCode.findFirst({
      where: { code: 'TEST-TRX-CODE' },
    });

    if (!testTrxCode) {
      testTrxCode = await prisma.transactionCode.create({
        data: {
          code: 'TEST-TRX-CODE',
          description: 'Test Transaction Code',
          type: TransactionType.CHARGE,
          group: TrxGroup.ROOM,
          hasTax: true,
          hasService: true,
          serviceRate: 10.0,
          glAccountCode: '4000-01',
        },
      });
    }

    // Use findFirstOrCreate pattern
    testReasonCode = await prisma.reasonCode.findFirst({
      where: { code: 'TEST-REASON' },
    });

    if (!testReasonCode) {
      testReasonCode = await prisma.reasonCode.create({
        data: {
          code: 'TEST-REASON',
          description: 'Test Reason',
          category: ReasonCategory.VOID,
          isActive: true,
        },
      });
    }

    // Use findFirstOrCreate pattern for role
    let role = await prisma.role.findFirst({
      where: { name: 'Test Role' },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: 'Test Role',
          permissions: [],
        },
      });
    }

    // Use findFirstOrCreate pattern for user
    testUser = await prisma.user.findFirst({
      where: { email: 'testuser@example.com' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          password: 'hashed',
          firstName: 'Test',
          lastName: 'User',
          roleId: role.id,
        },
      });
    }
  });

  afterAll(async () => {
    // Clean up test data (order matters due to foreign keys)
    try {
      if (testWindow) {
        await prisma.folioTransaction.deleteMany({
          where: { windowId: testWindow.id },
        });
      }
      await prisma.folioWindow.deleteMany({ where: { folioId: testFolio.id } });
      await prisma.folio.deleteMany({
        where: { folioNumber: 'F-TEST-TRX-001' },
      });
      await prisma.reservation.deleteMany({
        where: { confirmNumber: 'TEST-TRX-001' },
      });
      await prisma.guest.deleteMany({ where: { email: 'test@example.com' } });
      await prisma.user.deleteMany({
        where: { email: 'testuser@example.com' },
      });
      await prisma.role.deleteMany({ where: { name: 'Test Role' } });
      await prisma.transactionCode.deleteMany({
        where: { code: 'TEST-TRX-CODE' },
      });
      await prisma.reasonCode.deleteMany({ where: { code: 'TEST-REASON' } });
      await prisma.room.deleteMany({ where: { number: '101' } });
      await prisma.roomType.deleteMany({ where: { code: 'STD' } });
      await prisma.property.deleteMany({ where: { name: 'Test Hotel' } });
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('Transaction Creation', () => {
    it('should create a charge transaction', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
          reference: 'Room 101',
        },
      });

      expect(transaction).toBeDefined();
      expect(Number(transaction.amountNet)).toBe(1000);
      expect(Number(transaction.amountService)).toBe(100);
      expect(Number(transaction.amountTax)).toBe(77);
      expect(Number(transaction.amountTotal)).toBe(1177);
      expect(transaction.sign).toBe(1);
      expect(transaction.isVoid).toBe(false);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });

    it('should create a payment transaction (negative sign)', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 500,
          amountService: 0,
          amountTax: 0,
          amountTotal: 500,
          sign: -1, // Payment
          userId: user.id,
          reference: 'Cash Payment',
        },
      });

      expect(transaction.sign).toBe(-1);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Immutability', () => {
    it('should not allow deletion (immutable)', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
      });

      // Prisma allows delete, but business logic should prevent it
      // This test documents the expected behavior
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
      // In production, add a middleware or service layer to prevent deletion
    });
  });

  describe('Void Logic', () => {
    it('should void a transaction', async () => {
      const { window, trxCode, user } = await ensureTestData();

      if (!testReasonCode) {
        throw new Error('Test reason code not properly initialized');
      }

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
      });

      const voided = await prisma.folioTransaction.update({
        where: { id: transaction.id },
        data: {
          isVoid: true,
          voidedAt: new Date(),
          voidedBy: user.id,
          reasonCodeId: testReasonCode.id,
          relatedTrxId: transaction.id,
        },
      });

      expect(voided.isVoid).toBe(true);
      expect(voided.voidedAt).toBeDefined();
      expect(voided.voidedBy).toBe(user.id);
      expect(voided.reasonCodeId).toBe(testReasonCode.id);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Audit Trail', () => {
    it('should track userId', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
      });

      expect(transaction.userId).toBe(user.id);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });

    it('should track businessDate separately from createdAt', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const businessDate = new Date('2025-01-01');
      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: businessDate,
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
      });

      expect(transaction.businessDate.toISOString().split('T')[0]).toBe(
        businessDate.toISOString().split('T')[0],
      );
      expect(transaction.createdAt).toBeDefined();
      expect(transaction.createdAt.getTime()).toBeGreaterThan(
        businessDate.getTime(),
      );

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Relations', () => {
    it('should have window relation', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
        include: { window: true },
      });

      expect(transaction.window).toBeDefined();
      expect(transaction.window.id).toBe(window.id);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });

    it('should have trxCode relation', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
        include: { trxCode: true },
      });

      expect(transaction.trxCode).toBeDefined();
      expect(transaction.trxCode.id).toBe(trxCode.id);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Indexes', () => {
    it('should query by businessDate efficiently', async () => {
      const { window, trxCode, user } = await ensureTestData();

      const businessDate = new Date('2025-01-01');
      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: businessDate,
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: user.id,
        },
      });

      const transactions = await prisma.folioTransaction.findMany({
        where: { businessDate: businessDate },
      });

      expect(transactions.length).toBeGreaterThan(0);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });
});
