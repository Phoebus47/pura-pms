import { prisma } from './test-setup';
import {
  TransactionType,
  TrxGroup,
  FolioStatus,
  ReasonCategory,
  RoomStatus,
} from '@prisma/client';

describe('Financial Module Relations', () => {
  let testFolio: any;
  let testWindow: any;
  let testTrxCode: any;
  let testReservation: any;
  let testGuest: any;
  let testRoom: any;
  let testProperty: any;
  let testUser: any;

  beforeAll(async () => {
    // Create test data
    testProperty = await prisma.property.create({
      data: {
        name: 'Test Hotel Relations',
        currency: 'THB',
        timezone: 'Asia/Bangkok',
      },
    });

    const roomType = await prisma.roomType.create({
      data: {
        name: 'Standard Room',
        code: 'STD-REL',
        baseRate: 1000,
        propertyId: testProperty.id,
      },
    });

    testRoom = await prisma.room.create({
      data: {
        number: '201',
        floor: 2,
        status: RoomStatus.VACANT_CLEAN,
        roomTypeId: roomType.id,
        propertyId: testProperty.id,
      },
    });

    testGuest = await prisma.guest.create({
      data: {
        firstName: 'Relation',
        lastName: 'Test',
        email: 'relation@test.com',
        phone: '0812345679',
      },
    });

    testReservation = await prisma.reservation.create({
      data: {
        confirmNumber: 'REL-TEST-001',
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

    testFolio = await prisma.folio.create({
      data: {
        folioNumber: 'F-REL-TEST-001',
        reservationId: testReservation.id,
        status: FolioStatus.OPEN,
      },
    });

    testWindow = await prisma.folioWindow.create({
      data: {
        folioId: testFolio.id,
        windowNumber: 1,
      },
    });

    testTrxCode = await prisma.transactionCode.create({
      data: {
        code: 'REL-TRX-CODE',
        description: 'Relation Test Code',
        type: TransactionType.CHARGE,
        group: TrxGroup.ROOM,
        hasTax: true,
        hasService: true,
        serviceRate: 10.0,
        glAccountCode: '4000-01',
      },
    });

    const role = await prisma.role.create({
      data: {
        name: 'Relation Test Role',
        permissions: [],
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'relationuser@test.com',
        password: 'hashed',
        firstName: 'Relation',
        lastName: 'User',
        roleId: role.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.folioTransaction.deleteMany({
      where: { windowId: testWindow.id },
    });
    await prisma.folioWindow.deleteMany({ where: { folioId: testFolio.id } });
    await prisma.folio.deleteMany({ where: { folioNumber: 'F-REL-TEST-001' } });
    await prisma.reservation.deleteMany({
      where: { confirmNumber: 'REL-TEST-001' },
    });
    await prisma.guest.deleteMany({ where: { email: 'relation@test.com' } });
    await prisma.shift.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { email: 'relationuser@test.com' } });
    await prisma.role.deleteMany({ where: { name: 'Relation Test Role' } });
    await prisma.transactionCode.deleteMany({
      where: { code: 'REL-TRX-CODE' },
    });
    await prisma.room.deleteMany({ where: { number: '201' } });
    await prisma.roomType.deleteMany({ where: { code: 'STD-REL' } });
    await prisma.property.deleteMany({
      where: { name: 'Test Hotel Relations' },
    });
  });

  describe('Folio → FolioWindow → FolioTransaction', () => {
    it('should have complete relation chain', async () => {
      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: testWindow.id,
          trxCodeId: testTrxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
        },
      });

      const folioWithWindows = await prisma.folio.findUnique({
        where: { id: testFolio.id },
        include: {
          windows: {
            include: {
              transactions: {
                include: {
                  trxCode: true,
                },
              },
            },
          },
        },
      });

      expect(folioWithWindows).toBeDefined();
      expect(folioWithWindows?.windows.length).toBeGreaterThan(0);
      expect(folioWithWindows?.windows[0].transactions.length).toBeGreaterThan(
        0,
      );
      expect(
        folioWithWindows?.windows[0].transactions[0].trxCode,
      ).toBeDefined();

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Reservation → Folio → FolioWindow', () => {
    it('should access folio from reservation', async () => {
      const reservationWithFolios = await prisma.reservation.findUnique({
        where: { id: testReservation.id },
        include: {
          folios: {
            include: {
              windows: true,
            },
          },
        },
      });

      expect(reservationWithFolios).toBeDefined();
      expect(reservationWithFolios?.folios.length).toBeGreaterThan(0);
      expect(reservationWithFolios?.folios[0].windows.length).toBeGreaterThan(
        0,
      );
    });
  });

  describe('TransactionCode → FolioTransaction', () => {
    it('should access transactions from TransactionCode', async () => {
      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: testWindow.id,
          trxCodeId: testTrxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
        },
      });

      const trxCodeWithTransactions = await prisma.transactionCode.findUnique({
        where: { id: testTrxCode.id },
        include: { transactions: true },
      });

      expect(trxCodeWithTransactions).toBeDefined();
      expect(trxCodeWithTransactions?.transactions.length).toBeGreaterThan(0);
      expect(trxCodeWithTransactions?.transactions[0].id).toBe(transaction.id);

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
    });
  });

  describe('Shift → FolioTransaction', () => {
    it('should link transaction to shift', async () => {
      const shift = await prisma.shift.create({
        data: {
          shiftNumber: `SHIFT-REL-${Date.now()}`,
          userId: testUser.id,
          propertyId: testProperty.id,
          businessDate: testProperty.businessDate,
          startTime: new Date(),
          openingCash: 0,
        },
      });

      const transaction = await prisma.folioTransaction.create({
        data: {
          windowId: testWindow.id,
          trxCodeId: testTrxCode.id,
          businessDate: new Date('2025-01-01'),
          amountNet: 1000,
          amountService: 100,
          amountTax: 77,
          amountTotal: 1177,
          sign: 1,
          userId: testUser.id,
          shiftId: shift.id,
        },
      });

      const shiftWithTransactions = await prisma.shift.findUnique({
        where: { id: shift.id },
        include: { folioTransactions: true },
      });

      expect(shiftWithTransactions).toBeDefined();
      expect(shiftWithTransactions?.folioTransactions.length).toBeGreaterThan(
        0,
      );
      expect(shiftWithTransactions?.folioTransactions[0].id).toBe(
        transaction.id,
      );

      // Clean up
      await prisma.folioTransaction.delete({ where: { id: transaction.id } });
      await prisma.shift.delete({ where: { id: shift.id } });
    });

    it('should belong to Property with Restrict delete', async () => {
      const shift = await prisma.shift.create({
        data: {
          shiftNumber: `SHIFT-PROP-${Date.now()}`,
          userId: testUser.id,
          propertyId: testProperty.id,
          businessDate: testProperty.businessDate,
          startTime: new Date(),
          openingCash: 0,
        },
      });

      const propertyWithShifts = await prisma.property.findUnique({
        where: { id: testProperty.id },
        include: { shifts: true },
      });

      expect(propertyWithShifts?.shifts.length).toBeGreaterThan(0);
      expect(
        propertyWithShifts?.shifts.some((row) => row.id === shift.id),
      ).toBe(true);

      const shiftIndexes = await prisma.$queryRaw<Array<{ indexname: string }>>`
        SELECT indexname FROM pg_indexes
        WHERE indexname IN (
          'Shift_propertyId_businessDate_status_idx',
          'Shift_userId_status_idx',
          'FolioTransaction_shiftId_idx'
        )
      `;
      const indexNames = shiftIndexes.map((row) => row.indexname);
      expect(indexNames).toEqual(
        expect.arrayContaining([
          'Shift_propertyId_businessDate_status_idx',
          'Shift_userId_status_idx',
          'FolioTransaction_shiftId_idx',
        ]),
      );

      await expect(
        prisma.property.delete({ where: { id: testProperty.id } }),
      ).rejects.toThrow();

      await prisma.shift.delete({ where: { id: shift.id } });
    });
  });

  describe('Reservation → ReservationStay', () => {
    it('should leave header-only reservations without stay rows', async () => {
      const reservation = await prisma.reservation.findUnique({
        where: { id: testReservation.id },
        include: { stays: true },
      });

      expect(reservation?.stays).toEqual([]);
    });

    it('should persist ordered stay segments and cascade on delete', async () => {
      const suiteType = await prisma.roomType.create({
        data: {
          name: 'Suite Relations',
          code: 'STE-REL',
          baseRate: 2000,
          propertyId: testProperty.id,
        },
      });
      const suiteRoom = await prisma.room.create({
        data: {
          number: '301',
          floor: 3,
          status: RoomStatus.VACANT_CLEAN,
          roomTypeId: suiteType.id,
          propertyId: testProperty.id,
        },
      });
      const splitReservation = await prisma.reservation.create({
        data: {
          confirmNumber: 'REL-SPLIT-001',
          checkIn: new Date('2025-02-01'),
          checkOut: new Date('2025-02-05'),
          nights: 4,
          adults: 2,
          roomRate: 1000,
          totalAmount: 6000,
          roomId: testRoom.id,
          guestId: testGuest.id,
          stays: {
            create: [
              {
                sequence: 0,
                startDate: new Date('2025-02-01'),
                endDate: new Date('2025-02-03'),
                nights: 2,
                roomId: testRoom.id,
                roomTypeId: testRoom.roomTypeId,
                roomRate: 1000,
              },
              {
                sequence: 1,
                startDate: new Date('2025-02-03'),
                endDate: new Date('2025-02-05'),
                nights: 2,
                roomId: suiteRoom.id,
                roomTypeId: suiteType.id,
                roomRate: 2000,
              },
            ],
          },
        },
        include: { stays: { orderBy: { sequence: 'asc' } } },
      });

      expect(splitReservation.stays).toHaveLength(2);
      expect(splitReservation.stays[0].roomId).toBe(testRoom.id);
      expect(splitReservation.stays[1].roomId).toBe(suiteRoom.id);

      await expect(
        prisma.reservationStay.create({
          data: {
            reservationId: splitReservation.id,
            sequence: 0,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-02'),
            nights: 1,
            roomId: testRoom.id,
            roomTypeId: testRoom.roomTypeId,
            roomRate: 1000,
          },
        }),
      ).rejects.toThrow();

      await prisma.reservation.delete({
        where: { id: splitReservation.id },
      });
      const leftover = await prisma.reservationStay.findMany({
        where: { reservationId: splitReservation.id },
      });
      expect(leftover).toHaveLength(0);

      await prisma.room.delete({ where: { id: suiteRoom.id } });
      await prisma.roomType.delete({ where: { id: suiteType.id } });
    });
  });
});
