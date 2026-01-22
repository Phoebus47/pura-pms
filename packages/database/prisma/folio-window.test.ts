import { prisma } from './test-setup';
import { FolioStatus, RoomStatus } from '@prisma/client';

describe('FolioWindow Model', () => {
  let testFolio: any;
  let testReservation: any;
  let testGuest: any;
  let testRoom: any;
  let testProperty: any;

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
      where: { confirmNumber: 'TEST-001' },
    });

    if (!testReservation) {
      testReservation = await prisma.reservation.create({
        data: {
          confirmNumber: 'TEST-001',
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
      where: { folioNumber: 'F-TEST-001' },
    });

    if (!testFolio) {
      testFolio = await prisma.folio.create({
        data: {
          folioNumber: 'F-TEST-001',
          reservationId: testReservation.id,
          status: FolioStatus.OPEN,
        },
      });
    }
  });

  afterAll(async () => {
    // Clean up test data (order matters due to foreign keys)
    try {
      await prisma.folio.deleteMany({ where: { folioNumber: 'F-TEST-001' } });
      await prisma.reservation.deleteMany({
        where: { confirmNumber: 'TEST-001' },
      });
      await prisma.guest.deleteMany({ where: { email: 'test@example.com' } });
      await prisma.room.deleteMany({ where: { number: '101' } });
      await prisma.roomType.deleteMany({ where: { code: 'STD' } });
      await prisma.property.deleteMany({ where: { name: 'Test Hotel' } });
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('Window Creation', () => {
    it('should create a default window (Window 1)', async () => {
      if (!testFolio) {
        throw new Error('Test folio not properly initialized');
      }

      // Use findFirstOrCreate pattern
      let window = await prisma.folioWindow.findFirst({
        where: { folioId: testFolio.id, windowNumber: 1 },
      });

      if (!window) {
        window = await prisma.folioWindow.create({
          data: {
            folioId: testFolio.id,
            windowNumber: 1,
            description: 'Personal Expenses',
          },
        });
      }

      expect(window).toBeDefined();
      expect(window.windowNumber).toBe(1);
      expect(Number(window.balance)).toBe(0); // Decimal returns as string
      expect(window.folioId).toBe(testFolio.id);

      // Clean up
      await prisma.folioWindow.delete({ where: { id: window.id } });
    });

    it('should enforce unique window number per folio', async () => {
      if (!testFolio) {
        throw new Error('Test folio not properly initialized');
      }

      // Clean up any existing window first
      await prisma.folioWindow.deleteMany({
        where: { folioId: testFolio.id, windowNumber: 1 },
      });

      const window1 = await prisma.folioWindow.create({
        data: {
          folioId: testFolio.id,
          windowNumber: 1,
        },
      });

      await expect(
        prisma.folioWindow.create({
          data: {
            folioId: testFolio.id,
            windowNumber: 1, // Duplicate
          },
        }),
      ).rejects.toThrow();

      // Clean up
      await prisma.folioWindow.delete({ where: { id: window1.id } });
    });

    it('should allow same window number for different folios', async () => {
      if (!testFolio || !testReservation) {
        throw new Error('Test data not properly initialized');
      }

      // Use findFirstOrCreate pattern for folio2
      let folio2 = await prisma.folio.findFirst({
        where: { folioNumber: 'F-TEST-002' },
      });

      if (!folio2) {
        folio2 = await prisma.folio.create({
          data: {
            folioNumber: 'F-TEST-002',
            reservationId: testReservation.id,
            status: FolioStatus.OPEN,
          },
        });
      }

      // Clean up any existing windows first
      await prisma.folioWindow.deleteMany({
        where: { folioId: testFolio.id, windowNumber: 1 },
      });
      await prisma.folioWindow.deleteMany({
        where: { folioId: folio2.id, windowNumber: 1 },
      });

      const window1 = await prisma.folioWindow.create({
        data: {
          folioId: testFolio.id,
          windowNumber: 1,
        },
      });

      const window2 = await prisma.folioWindow.create({
        data: {
          folioId: folio2.id,
          windowNumber: 1, // Same number, different folio
        },
      });

      expect(window1.windowNumber).toBe(window2.windowNumber);
      expect(window1.folioId).not.toBe(window2.folioId);

      // Clean up
      await prisma.folioWindow.deleteMany({
        where: { id: { in: [window1.id, window2.id] } },
      });
      await prisma.folio.delete({ where: { id: folio2.id } });
    });
  });

  describe('Balance Calculation', () => {
    it('should initialize balance to 0', async () => {
      if (!testFolio) {
        throw new Error('Test folio not properly initialized');
      }

      // Use findFirstOrCreate pattern
      let window = await prisma.folioWindow.findFirst({
        where: { folioId: testFolio.id, windowNumber: 1 },
      });

      if (!window) {
        window = await prisma.folioWindow.create({
          data: {
            folioId: testFolio.id,
            windowNumber: 1,
          },
        });
      }

      expect(Number(window.balance)).toBe(0); // Decimal returns as string

      // Clean up
      await prisma.folioWindow.delete({ where: { id: window.id } });
    });

    it('should have transactions relation', async () => {
      if (!testFolio) {
        throw new Error('Test folio not properly initialized');
      }

      // Use findFirstOrCreate pattern
      let window = await prisma.folioWindow.findFirst({
        where: { folioId: testFolio.id, windowNumber: 1 },
        include: { transactions: true },
      });

      if (!window) {
        window = await prisma.folioWindow.create({
          data: {
            folioId: testFolio.id,
            windowNumber: 1,
          },
          include: { transactions: true },
        });
      }

      expect(window.transactions).toBeDefined();
      expect(Array.isArray(window.transactions)).toBe(true);

      // Clean up
      await prisma.folioWindow.delete({ where: { id: window.id } });
    });
  });

  describe('Cascade Delete', () => {
    it('should cascade delete windows when folio is deleted', async () => {
      if (!testReservation) {
        throw new Error('Test reservation not properly initialized');
      }

      const testFolio2 = await prisma.folio.create({
        data: {
          folioNumber: 'F-TEST-CASCADE',
          reservationId: testReservation.id,
          status: FolioStatus.OPEN,
        },
      });

      const window = await prisma.folioWindow.create({
        data: {
          folioId: testFolio2.id,
          windowNumber: 1,
        },
      });

      await prisma.folio.delete({ where: { id: testFolio2.id } });

      const foundWindow = await prisma.folioWindow.findUnique({
        where: { id: window.id },
      });

      expect(foundWindow).toBeNull();
    });
  });
});
