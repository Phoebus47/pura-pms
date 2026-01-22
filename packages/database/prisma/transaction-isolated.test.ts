import { prisma, runInTransaction } from './test-setup';
import { TransactionType, TrxGroup } from '@prisma/client';

/**
 * Transaction Isolation Tests
 *
 * These tests demonstrate database transaction isolation patterns
 * where each test runs in its own transaction and automatically rolls back.
 *
 * Benefits:
 * - Complete test isolation
 * - No cleanup required
 * - Faster execution
 * - No side effects between tests
 */
describe('Transaction Isolation Tests', () => {
  describe('TransactionCode with Isolation', () => {
    it('should create and rollback automatically', async () => {
      await runInTransaction(async (tx) => {
        const trxCode = await tx.transactionCode.create({
          data: {
            code: 'ISOLATED-001',
            description: 'Isolated Test Code',
            type: TransactionType.CHARGE,
            group: TrxGroup.ROOM,
            hasTax: true,
            hasService: true,
            serviceRate: 10.0,
            glAccountCode: '4000-01',
          },
        });

        expect(trxCode).toBeDefined();
        expect(trxCode.code).toBe('ISOLATED-001');

        // Verify it exists within transaction
        const found = await tx.transactionCode.findUnique({
          where: { code: 'ISOLATED-001' },
        });
        expect(found).toBeDefined();
      });

      // After transaction, it should not exist (rolled back)
      const found = await prisma.transactionCode.findUnique({
        where: { code: 'ISOLATED-001' },
      });
      expect(found).toBeNull();
    });

    it('should allow multiple tests to use same code without conflicts', async () => {
      // Test 1
      await runInTransaction(async (tx) => {
        await tx.transactionCode.create({
          data: {
            code: 'SHARED-CODE',
            description: 'Test 1',
            type: TransactionType.CHARGE,
            group: TrxGroup.ROOM,
            hasTax: false,
            hasService: false,
            glAccountCode: '4000-01',
          },
        });

        const count = await tx.transactionCode.count({
          where: { code: 'SHARED-CODE' },
        });
        expect(count).toBe(1);
      });

      // Test 2 - Can reuse same code because Test 1 rolled back
      await runInTransaction(async (tx) => {
        await tx.transactionCode.create({
          data: {
            code: 'SHARED-CODE', // Same code!
            description: 'Test 2',
            type: TransactionType.PAYMENT,
            group: TrxGroup.ROOM,
            hasTax: false,
            hasService: false,
            glAccountCode: '4000-01',
          },
        });

        const found = await tx.transactionCode.findUnique({
          where: { code: 'SHARED-CODE' },
        });
        expect(found?.description).toBe('Test 2');
      });

      // Verify nothing persisted
      const found = await prisma.transactionCode.findUnique({
        where: { code: 'SHARED-CODE' },
      });
      expect(found).toBeNull();
    });
  });

  describe('Complex Relations with Isolation', () => {
    it('should create full folio hierarchy and rollback', async () => {
      await runInTransaction(async (tx) => {
        // Create property
        const property = await tx.property.create({
          data: {
            name: 'Isolated Hotel',
            currency: 'THB',
            timezone: 'Asia/Bangkok',
          },
        });

        // Create room type
        const roomType = await tx.roomType.create({
          data: {
            name: 'Isolated Room',
            code: 'ISO-001',
            baseRate: 1000,
            propertyId: property.id,
          },
        });

        // Create room
        const room = await tx.room.create({
          data: {
            number: 'ISO-101',
            floor: 1,
            status: 'VACANT_CLEAN',
            roomTypeId: roomType.id,
            propertyId: property.id,
          },
        });

        // Create guest
        const guest = await tx.guest.create({
          data: {
            firstName: 'Isolated',
            lastName: 'Guest',
            email: 'isolated@test.com',
            phone: '0800000000',
          },
        });

        // Create reservation
        const reservation = await tx.reservation.create({
          data: {
            confirmNumber: 'ISO-RES-001',
            checkIn: new Date('2025-01-01'),
            checkOut: new Date('2025-01-05'),
            nights: 4,
            adults: 2,
            roomRate: 1000,
            totalAmount: 4000,
            roomId: room.id,
            guestId: guest.id,
          },
        });

        // Create folio
        const folio = await tx.folio.create({
          data: {
            folioNumber: 'F-ISO-001',
            reservationId: reservation.id,
            status: 'OPEN',
          },
        });

        // Verify all created within transaction
        expect(property).toBeDefined();
        expect(roomType).toBeDefined();
        expect(room).toBeDefined();
        expect(guest).toBeDefined();
        expect(reservation).toBeDefined();
        expect(folio).toBeDefined();

        // Verify relations
        const folioWithReservation = await tx.folio.findUnique({
          where: { id: folio.id },
          include: {
            reservation: {
              include: {
                guest: true,
                room: true,
              },
            },
          },
        });

        expect(folioWithReservation?.reservation.guest.email).toBe(
          'isolated@test.com',
        );
      });

      // After transaction, nothing should exist
      const property = await prisma.property.findFirst({
        where: { name: 'Isolated Hotel' },
      });
      expect(property).toBeNull();

      const guest = await prisma.guest.findFirst({
        where: { email: 'isolated@test.com' },
      });
      expect(guest).toBeNull();
    });
  });

  describe('Isolation Benefits Demo', () => {
    it('should allow parallel tests without conflicts (Test A)', async () => {
      await runInTransaction(async (tx) => {
        const guest = await tx.guest.create({
          data: {
            firstName: 'Parallel',
            lastName: 'A',
            email: 'parallel@test.com',
            phone: '0811111111',
          },
        });
        expect(guest.lastName).toBe('A');
      });
    });

    it('should allow parallel tests without conflicts (Test B)', async () => {
      await runInTransaction(async (tx) => {
        const guest = await tx.guest.create({
          data: {
            firstName: 'Parallel',
            lastName: 'B',
            email: 'parallel@test.com', // Same email!
            phone: '0822222222',
          },
        });
        expect(guest.lastName).toBe('B');
      });
    });

    it('should verify no data leaked from previous tests', async () => {
      const guests = await prisma.guest.findMany({
        where: { email: 'parallel@test.com' },
      });
      expect(guests.length).toBe(0);
    });
  });
});
