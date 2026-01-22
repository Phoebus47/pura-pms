import { prisma } from './test-setup';
import {
  TransactionType,
  TrxGroup,
  FolioStatus,
  RoomStatus,
} from '@prisma/client';

describe('Performance Tests', () => {
  let testProperty: any;
  let testRoomType: any;
  let testRoom: any;
  let testGuest: any;
  let testUser: any;
  let testRole: any;

  beforeAll(async () => {
    // Create minimal test data
    testProperty = await prisma.property.findFirst({
      where: { name: 'Performance Test Hotel' },
    });
    if (!testProperty) {
      testProperty = await prisma.property.create({
        data: {
          name: 'Performance Test Hotel',
          currency: 'THB',
          timezone: 'Asia/Bangkok',
        },
      });
    }

    testRoomType = await prisma.roomType.findFirst({
      where: { code: 'PERF-STD' },
    });
    if (!testRoomType) {
      testRoomType = await prisma.roomType.create({
        data: {
          name: 'Performance Standard',
          code: 'PERF-STD',
          baseRate: 1000,
          propertyId: testProperty.id,
        },
      });
    }

    testRoom = await prisma.room.findFirst({
      where: { number: '999' },
    });
    if (!testRoom) {
      testRoom = await prisma.room.create({
        data: {
          number: '999',
          floor: 9,
          status: RoomStatus.VACANT_CLEAN,
          roomTypeId: testRoomType.id,
          propertyId: testProperty.id,
        },
      });
    }

    testGuest = await prisma.guest.findFirst({
      where: { email: 'perf@test.com' },
    });
    if (!testGuest) {
      testGuest = await prisma.guest.create({
        data: {
          firstName: 'Performance',
          lastName: 'Test',
          email: 'perf@test.com',
          phone: '0899999999',
        },
      });
    }

    testRole = await prisma.role.findFirst({
      where: { name: 'Performance Test Role' },
    });
    if (!testRole) {
      testRole = await prisma.role.create({
        data: {
          name: 'Performance Test Role',
          permissions: [],
        },
      });
    }

    testUser = await prisma.user.findFirst({
      where: { email: 'perfuser@test.com' },
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'perfuser@test.com',
          password: 'hashed',
          firstName: 'Performance',
          lastName: 'User',
          roleId: testRole.id,
        },
      });
    }
  });

  afterAll(async () => {
    // Clean up performance test data
    await prisma.folioTransaction.deleteMany({
      where: {
        window: {
          folio: {
            reservation: {
              guestId: testGuest.id,
            },
          },
        },
      },
    });
    await prisma.folioWindow.deleteMany({
      where: {
        folio: {
          reservation: {
            guestId: testGuest.id,
          },
        },
      },
    });
    await prisma.folio.deleteMany({
      where: {
        reservation: {
          guestId: testGuest.id,
        },
      },
    });
    await prisma.reservation.deleteMany({
      where: { guestId: testGuest.id },
    });
    await prisma.guest.deleteMany({ where: { email: 'perf@test.com' } });
    await prisma.user.deleteMany({ where: { email: 'perfuser@test.com' } });
    await prisma.role.deleteMany({ where: { name: 'Performance Test Role' } });
    await prisma.room.deleteMany({ where: { number: '999' } });
    await prisma.roomType.deleteMany({ where: { code: 'PERF-STD' } });
    await prisma.property.deleteMany({
      where: { name: 'Performance Test Hotel' },
    });
  });

  describe('Index Efficiency', () => {
    it('should efficiently query transactions by businessDate (indexed)', async () => {
      // Create test data
      const reservation = await prisma.reservation.create({
        data: {
          confirmNumber: `PERF-${Date.now()}`,
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

      const folio = await prisma.folio.create({
        data: {
          folioNumber: `F-PERF-${Date.now()}`,
          reservationId: reservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: folio.id,
          windowNumber: 1,
        },
      });

      const trxCode = await prisma.transactionCode.findFirst({
        where: { code: '1000' },
      });

      if (!trxCode) {
        throw new Error(
          'Transaction code 1000 not found. Please run seed script.',
        );
      }

      // Create 100 transactions
      const transactions = [];
      for (let i = 0; i < 100; i++) {
        transactions.push({
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date(
            `2025-01-${String((i % 31) + 1).padStart(2, '0')}`,
          ),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
        });
      }

      const startCreate = Date.now();
      await prisma.folioTransaction.createMany({
        data: transactions,
      });
      const createTime = Date.now() - startCreate;

      // Query by businessDate (should use index)
      const startQuery = Date.now();
      const results = await prisma.folioTransaction.findMany({
        where: {
          businessDate: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
        },
      });
      const queryTime = Date.now() - startQuery;

      expect(results.length).toBeGreaterThanOrEqual(100);
      expect(createTime).toBeLessThan(5000); // Should create 100 records in < 5s
      expect(queryTime).toBeLessThan(1000); // Should query in < 1s (with index)

      console.log(`\n📊 Index Efficiency Test:`);
      console.log(`  ✓ Created 100 transactions in ${createTime}ms`);
      console.log(`  ✓ Queried by businessDate in ${queryTime}ms`);
      console.log(`  ✓ Found ${results.length} transactions`);

      // Clean up
      await prisma.folioTransaction.deleteMany({
        where: { windowId: window.id },
      });
      await prisma.folioWindow.delete({ where: { id: window.id } });
      await prisma.folio.delete({ where: { id: folio.id } });
      await prisma.reservation.delete({ where: { id: reservation.id } });
    });

    it('should efficiently query transactions by userId (indexed)', async () => {
      // Create test data
      const reservation = await prisma.reservation.create({
        data: {
          confirmNumber: `PERF-USER-${Date.now()}`,
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

      const folio = await prisma.folio.create({
        data: {
          folioNumber: `F-PERF-USER-${Date.now()}`,
          reservationId: reservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: folio.id,
          windowNumber: 1,
        },
      });

      const trxCode = await prisma.transactionCode.findFirst({
        where: { code: '1000' },
      });

      if (!trxCode) {
        throw new Error('Transaction code 1000 not found');
      }

      // Create 50 transactions
      const transactions = [];
      for (let i = 0; i < 50; i++) {
        transactions.push({
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
        });
      }

      await prisma.folioTransaction.createMany({ data: transactions });

      // Query by userId (should use index)
      const startQuery = Date.now();
      const results = await prisma.folioTransaction.findMany({
        where: { userId: testUser.id },
      });
      const queryTime = Date.now() - startQuery;

      expect(results.length).toBeGreaterThanOrEqual(50);
      expect(queryTime).toBeLessThan(1000); // Should query in < 1s

      console.log(`\n📊 User Index Test:`);
      console.log(`  ✓ Queried by userId in ${queryTime}ms`);
      console.log(`  ✓ Found ${results.length} transactions`);

      // Clean up
      await prisma.folioTransaction.deleteMany({
        where: { windowId: window.id },
      });
      await prisma.folioWindow.delete({ where: { id: window.id } });
      await prisma.folio.delete({ where: { id: folio.id } });
      await prisma.reservation.delete({ where: { id: reservation.id } });
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle bulk transaction creation efficiently', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          confirmNumber: `PERF-BULK-${Date.now()}`,
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

      const folio = await prisma.folio.create({
        data: {
          folioNumber: `F-PERF-BULK-${Date.now()}`,
          reservationId: reservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: folio.id,
          windowNumber: 1,
        },
      });

      const trxCode = await prisma.transactionCode.findFirst({
        where: { code: '1000' },
      });

      if (!trxCode) {
        throw new Error('Transaction code 1000 not found');
      }

      // Test bulk creation (500 transactions)
      const bulkSize = 500;
      const transactions = [];
      for (let i = 0; i < bulkSize; i++) {
        transactions.push({
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000 + i,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177 + i,
          sign: 1,
          userId: testUser.id,
        });
      }

      const startBulk = Date.now();
      await prisma.folioTransaction.createMany({
        data: transactions,
      });
      const bulkTime = Date.now() - startBulk;

      // Verify count
      const count = await prisma.folioTransaction.count({
        where: { windowId: window.id },
      });

      expect(count).toBe(bulkSize);
      expect(bulkTime).toBeLessThan(10000); // Should create 500 records in < 10s

      console.log(`\n📊 Large Dataset Test:`);
      console.log(`  ✓ Created ${bulkSize} transactions in ${bulkTime}ms`);
      console.log(
        `  ✓ Average: ${(bulkTime / bulkSize).toFixed(2)}ms per transaction`,
      );

      // Clean up
      await prisma.folioTransaction.deleteMany({
        where: { windowId: window.id },
      });
      await prisma.folioWindow.delete({ where: { id: window.id } });
      await prisma.folio.delete({ where: { id: folio.id } });
      await prisma.reservation.delete({ where: { id: reservation.id } });
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent transaction creation without conflicts', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          confirmNumber: `PERF-CONCURRENT-${Date.now()}`,
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

      const folio = await prisma.folio.create({
        data: {
          folioNumber: `F-PERF-CONCURRENT-${Date.now()}`,
          reservationId: reservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: folio.id,
          windowNumber: 1,
        },
      });

      const trxCode = await prisma.transactionCode.findFirst({
        where: { code: '1000' },
      });

      if (!trxCode) {
        throw new Error('Transaction code 1000 not found');
      }

      // Create 10 concurrent transactions
      const concurrentOps = [];
      for (let i = 0; i < 10; i++) {
        concurrentOps.push(
          prisma.folioTransaction.create({
            data: {
              windowId: window.id,
              trxCodeId: trxCode.id,
              businessDate: new Date('2025-01-01'),
              amountNet: 1000 + i,
              amountService: 100,
              amountTax: 77,
              amountTotal: 1177 + i,
              sign: 1,
              userId: testUser.id,
            },
          }),
        );
      }

      const startConcurrent = Date.now();
      const results = await Promise.all(concurrentOps);
      const concurrentTime = Date.now() - startConcurrent;

      expect(results.length).toBe(10);
      expect(concurrentTime).toBeLessThan(5000); // Should complete in < 5s

      console.log(`\n📊 Concurrent Operations Test:`);
      console.log(
        `  ✓ Created 10 concurrent transactions in ${concurrentTime}ms`,
      );
      console.log(`  ✓ All operations completed successfully`);

      // Clean up
      await prisma.folioTransaction.deleteMany({
        where: { windowId: window.id },
      });
      await prisma.folioWindow.delete({ where: { id: window.id } });
      await prisma.folio.delete({ where: { id: folio.id } });
      await prisma.reservation.delete({ where: { id: reservation.id } });
    });
  });

  describe('Query Optimization', () => {
    it('should efficiently query with relations (window -> transactions -> trxCode)', async () => {
      const reservation = await prisma.reservation.create({
        data: {
          confirmNumber: `PERF-RELATION-${Date.now()}`,
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

      const folio = await prisma.folio.create({
        data: {
          folioNumber: `F-PERF-RELATION-${Date.now()}`,
          reservationId: reservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: folio.id,
          windowNumber: 1,
        },
      });

      const trxCode = await prisma.transactionCode.findFirst({
        where: { code: '1000' },
      });

      if (!trxCode) {
        throw new Error('Transaction code 1000 not found');
      }

      // Create 50 transactions
      const transactions = [];
      for (let i = 0; i < 50; i++) {
        transactions.push({
          windowId: window.id,
          trxCodeId: trxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
        });
      }

      await prisma.folioTransaction.createMany({ data: transactions });

      // Query with deep relations
      const startQuery = Date.now();
      const windowWithRelations = await prisma.folioWindow.findUnique({
        where: { id: window.id },
        include: {
          transactions: {
            include: {
              trxCode: true,
            },
          },
          folio: {
            include: {
              reservation: true,
            },
          },
        },
      });
      const queryTime = Date.now() - startQuery;

      expect(windowWithRelations).toBeDefined();
      expect(windowWithRelations?.transactions).toBeDefined();
      expect(windowWithRelations?.transactions.length).toBe(50);
      expect(queryTime).toBeLessThan(2000); // Should query with relations in < 2s

      console.log(`\n📊 Query Optimization Test:`);
      console.log(`  ✓ Queried window with relations in ${queryTime}ms`);
      console.log(
        `  ✓ Fetched ${windowWithRelations?.transactions.length} transactions with relations`,
      );

      // Clean up
      await prisma.folioTransaction.deleteMany({
        where: { windowId: window.id },
      });
      await prisma.folioWindow.delete({ where: { id: window.id } });
      await prisma.folio.delete({ where: { id: folio.id } });
      await prisma.reservation.delete({ where: { id: reservation.id } });
    });
  });
});
