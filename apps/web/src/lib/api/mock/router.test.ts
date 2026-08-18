/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { routeMockRequest } from './router';
import { APIError } from '../client';
import { mockDb } from './data';

describe('Mock API Router', () => {
  const originalMockDb = structuredClone(mockDb);

  beforeEach(() => {
    // Reset mockDb to its original state before each test
    Object.assign(mockDb, structuredClone(originalMockDb));
  });

  describe('Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      const response: any = await routeMockRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@pura.com', password: 'admin123' }), // NOSONAR
      });
      expect(response.access_token).toBeDefined();
      expect(response.user.email).toBe('admin@pura.com');
    });

    it('should throw 401 with invalid credentials', async () => {
      await expect(
        routeMockRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: 'admin@pura.com', password: 'wrong' }), // NOSONAR
        }),
      ).rejects.toThrow(APIError);
    });

    it('should return current user for /auth/me', async () => {
      const response: any = await routeMockRequest('/auth/me', {
        method: 'GET',
      });
      expect(response.email).toBe('admin@pura.com');
    });

    it('should default to GET method when omitted', async () => {
      const response: any = await routeMockRequest('/auth/me', {});
      expect(response.email).toBe('admin@pura.com');
    });
  });

  describe('Metrics', () => {
    it('should return occupancy metrics', async () => {
      const response: any = await routeMockRequest('/metrics/occupancy', {
        method: 'GET',
      });
      expect(response.totalRooms).toBeDefined();
    });

    it('should return arrival metrics', async () => {
      const response: any = await routeMockRequest('/metrics/arrivals', {
        method: 'GET',
      });
      expect(response.arrivals).toBeDefined();
    });
  });

  describe('Daily Revenue Report', () => {
    it('groups mock folio transactions by trx code group', async () => {
      const response: any = await routeMockRequest(
        '/financial/reports/drr?propertyId=prop_mock_1&date=2026-08-14',
        { method: 'GET' },
      );
      expect(response.propertyId).toBe('prop_mock_1');
      expect(response.businessDate).toBe('2026-08-14');
      expect(response.summary.SPA.total).toBe(1765.5);
      expect(response.totalRevenue).toBeGreaterThan(0);
    });

    it('returns occupancy snapshot for Daily Flash', async () => {
      const response: any = await routeMockRequest(
        '/financial/reports/flash?propertyId=prop_mock_1&date=2026-08-14',
        { method: 'GET' },
      );
      expect(response.occupancy.totalRooms).toBeGreaterThan(0);
      expect(response.stayOvers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Properties', () => {
    it('should return all properties', async () => {
      const response: any = await routeMockRequest('/properties', {
        method: 'GET',
      });
      expect(Array.isArray(response)).toBe(true);
      expect(response.length).toBeGreaterThan(0);
    });

    it('should return a specific property by id', async () => {
      const propertyId = mockDb.properties[0].id;
      const response: any = await routeMockRequest(
        `/properties/${propertyId}`,
        {
          method: 'GET',
        },
      );
      expect(response.id).toBe(propertyId);
    });

    it('should create a new property', async () => {
      const response: any = await routeMockRequest('/properties', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Property' }),
      });
      expect(response.id).toBeDefined();
      expect(response.name).toBe('New Property');
    });

    it('should update a property', async () => {
      const propertyId = mockDb.properties[0].id;
      const response: any = await routeMockRequest(
        `/properties/${propertyId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated Property' }),
        },
      );
      expect(response.name).toBe('Updated Property');
    });

    it('should delete a property', async () => {
      const propertyId = mockDb.properties[0].id;
      const response: any = await routeMockRequest(
        `/properties/${propertyId}`,
        {
          method: 'DELETE',
        },
      );
      expect(response.success).toBe(true);
    });

    it('should not update if property not found', async () => {
      await expect(
        routeMockRequest(`/properties/invalid-id`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Updated' }),
        }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Rooms', () => {
    it('should return all rooms', async () => {
      const response: any = await routeMockRequest('/rooms', {
        method: 'GET',
      });
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return a specific room by id', async () => {
      const roomId = mockDb.rooms[0].id;
      const response: any = await routeMockRequest(`/rooms/${roomId}`, {
        method: 'GET',
      });
      expect(response.id).toBe(roomId);
    });

    it('should create a room', async () => {
      const response: any = await routeMockRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify({ number: '999' }),
      });
      expect(response.id).toBeDefined();
    });

    it('should update a room', async () => {
      const roomId = mockDb.rooms[0].id;
      const response: any = await routeMockRequest(`/rooms/${roomId}`, {
        method: 'PATCH',
        body: JSON.stringify({ condition: 'CLEAN' }),
      });
      expect(response.condition).toBe('CLEAN');
    });

    it('should update a room status', async () => {
      const roomId = mockDb.rooms[0].id;
      const response: any = await routeMockRequest(`/rooms/${roomId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'OCCUPIED_CLEAN' }),
      });
      expect(response.status).toBe('OCCUPIED_CLEAN');
    });

    it('should delete a room', async () => {
      const roomId = mockDb.rooms[0].id;
      const response: any = await routeMockRequest(`/rooms/${roomId}`, {
        method: 'DELETE',
      });
      expect(response.success).toBe(true);
    });

    it('should not update if room not found', async () => {
      await expect(
        routeMockRequest(`/rooms/invalid-id`, {
          method: 'PATCH',
          body: JSON.stringify({ condition: 'CLEAN' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should not update status if room not found', async () => {
      await expect(
        routeMockRequest(`/rooms/invalid-id/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'OCCUPIED_CLEAN' }),
        }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Guests', () => {
    it('should return guests with pagination and search', async () => {
      const response: any = await routeMockRequest(
        '/guests?search=john&limit=10&offset=0',
        {
          method: 'GET',
        },
      );
      expect(response.data).toBeDefined();
      expect(response.total).toBeDefined();
    });

    it('should get guests without query params', async () => {
      const response: any = await routeMockRequest('/guests', {
        method: 'GET',
      });
      expect(response.data).toBeDefined();
      expect(response.limit).toBe(50);
      expect(response.offset).toBe(0);
    });

    it('should return a guest by id', async () => {
      const guestId = mockDb.guests[0].id;
      const response: any = await routeMockRequest(`/guests/${guestId}`, {
        method: 'GET',
      });
      expect(response.id).toBe(guestId);
    });

    it('should create a guest', async () => {
      const response: any = await routeMockRequest('/guests', {
        method: 'POST',
        body: JSON.stringify({ firstName: 'New', lastName: 'Guest' }),
      });
      expect(response.id).toBeDefined();
    });

    it('should update a guest', async () => {
      const guestId = mockDb.guests[0].id;
      const response: any = await routeMockRequest(`/guests/${guestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ firstName: 'Updated' }),
      });
      expect(response.firstName).toBe('Updated');
    });

    it('should toggle guest blacklist status', async () => {
      const guestId = mockDb.guests[0].id;
      const response: any = await routeMockRequest(
        `/guests/${guestId}/blacklist`,
        {
          method: 'PATCH',
        },
      );
      expect(response.id).toBe(guestId);
      // Depending on the implementation it toggles `isBlacklist`
    });

    it('should delete a guest', async () => {
      const guestId = mockDb.guests[0].id;
      const response: any = await routeMockRequest(`/guests/${guestId}`, {
        method: 'DELETE',
      });
      expect(response.success).toBe(true);
    });

    it('should not delete if guest id is missing', async () => {
      await expect(
        routeMockRequest(`/guests/`, {
          method: 'DELETE',
        }),
      ).rejects.toThrow(APIError);
    });

    it('should not update if guest not found', async () => {
      await expect(
        routeMockRequest(`/guests/invalid-id`, {
          method: 'PATCH',
          body: JSON.stringify({ firstName: 'Updated' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should not toggle blacklist if guest not found', async () => {
      await expect(
        routeMockRequest(`/guests/invalid-id/blacklist`, { method: 'PATCH' }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Reservations', () => {
    it('should return all reservations', async () => {
      const response: any = await routeMockRequest('/reservations', {
        method: 'GET',
      });
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return a reservation by id', async () => {
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(`/reservations/${resId}`, {
        method: 'GET',
      });
      expect(response.id).toBe(resId);
    });

    it('should create a reservation', async () => {
      const response: any = await routeMockRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({ guestId: '123' }),
      });
      expect(response.id).toBeDefined();
    });

    it('should filter complimentary reservations', async () => {
      const response: any = await routeMockRequest(
        '/reservations?stayPurpose=COMPLIMENTARY',
        { method: 'GET' },
      );
      expect(response).toHaveLength(1);
      expect(response[0].stayPurpose).toBe('COMPLIMENTARY');
    });

    it('should zero rates when creating a complimentary reservation', async () => {
      const response: any = await routeMockRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          guestId: '123',
          stayPurpose: 'COMPLIMENTARY',
          approvedBy: 'GM',
          roomRate: 3500,
          totalAmount: 7000,
        }),
      });
      expect(response.roomRate).toBe(0);
      expect(response.totalAmount).toBe(0);
      expect(response.rateCode).toBe('COMP');
    });

    it('should persist nested stay segments on create', async () => {
      const stays = [
        {
          startDate: '2026-08-14',
          endDate: '2026-08-16',
          roomId: 'room-1',
          roomRate: 1000,
        },
        {
          startDate: '2026-08-16',
          endDate: '2026-08-18',
          roomId: 'room-2',
          roomRate: 1500,
        },
      ];
      const response: any = await routeMockRequest('/reservations', {
        method: 'POST',
        body: JSON.stringify({ guestId: '123', stays }),
      });
      expect(response.stays).toEqual(stays);
    });

    it('should update a reservation', async () => {
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(`/reservations/${resId}`, {
        method: 'PATCH',
        body: JSON.stringify({ adults: 3 }),
      });
      expect(response.adults).toBe(3);
    });

    it('should check in a reservation', async () => {
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(
        `/reservations/${resId}/check-in`,
        {
          method: 'POST',
        },
      );
      expect(response.status).toBe('CHECKED_IN');
    });

    it('should check out a reservation', async () => {
      // we need a checked in reservation
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(
        `/reservations/${resId}/check-out`,
        {
          method: 'POST',
        },
      );
      expect(response.status).toBe('CHECKED_OUT');
    });

    it('should move a checked-in guest to a vacant room', async () => {
      const resId = mockDb.reservations[0].id;
      const fromRoomId = mockDb.reservations[0].roomId;
      const response: any = await routeMockRequest(
        `/reservations/${resId}/room-move`,
        {
          method: 'POST',
          body: JSON.stringify({
            toRoomId: 'rm_mock_1',
            movedBy: 'usr_mock_1',
            reason: 'Upgrade',
          }),
        },
      );
      expect(response.roomId).toBe('rm_mock_1');
      expect(
        mockDb.rooms.find((room: any) => room.id === fromRoomId).status,
      ).toBe('VACANT_DIRTY');
      expect(
        mockDb.rooms.find((room: any) => room.id === 'rm_mock_1').status,
      ).toBe('OCCUPIED_CLEAN');

      const history: any = await routeMockRequest(
        `/reservations/${resId}/room-moves`,
        { method: 'GET' },
      );
      expect(history).toHaveLength(1);
      expect(history[0].toRoomId).toBe('rm_mock_1');
      expect(history[0].folioTransferred).toBe(true);
    });

    it('should reject a room move when the reservation is not checked in', async () => {
      await expect(
        routeMockRequest(`/reservations/res_mock_2/room-move`, {
          method: 'POST',
          body: JSON.stringify({
            toRoomId: 'rm_mock_1',
            movedBy: 'usr_mock_1',
          }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should mark a confirmed past arrival as no-show', async () => {
      mockDb.reservations[1].checkIn = new Date(
        Date.now() - 86400000,
      ).toISOString();
      const response: any = await routeMockRequest(
        `/reservations/res_mock_2/no-show`,
        {
          method: 'POST',
          body: JSON.stringify({ userId: 'usr_mock_1' }),
        },
      );
      expect(response.status).toBe('NO_SHOW');
    });

    it('should reject no-show before the arrival date', async () => {
      await expect(
        routeMockRequest(`/reservations/res_mock_2/no-show`, {
          method: 'POST',
          body: JSON.stringify({ userId: 'usr_mock_1' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should reject no-show when the reservation is not confirmed', async () => {
      await expect(
        routeMockRequest(`/reservations/res_mock_1/no-show`, {
          method: 'POST',
          body: JSON.stringify({ userId: 'usr_mock_1' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should walk a confirmed reservation to a partner hotel', async () => {
      const hotel: any = await routeMockRequest('/partner-hotels', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: mockDb.properties[0].id,
          name: 'Grand Partner Hotel',
          phone: '02-000-0000',
        }),
      });

      const response: any = await routeMockRequest(
        `/reservations/res_mock_2/walk`,
        {
          method: 'POST',
          body: JSON.stringify({
            partnerHotelId: hotel.id,
            cost: 1500,
            compensationAmount: 500,
            reason: 'Overbooked',
            walkedBy: 'usr_mock_1',
          }),
        },
      );
      expect(response.status).toBe('WALKED');

      const history: any = await routeMockRequest(
        `/reservations/res_mock_2/walks`,
        { method: 'GET' },
      );
      expect(history).toHaveLength(1);
      expect(history[0].partnerHotelId).toBe(hotel.id);
      expect(history[0].cost).toBe(1500);
      expect(history[0].compensationAmount).toBe(500);
    });

    it('should reject a walk when the reservation is not confirmed', async () => {
      const hotel: any = await routeMockRequest('/partner-hotels', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: mockDb.properties[0].id,
          name: 'Another Partner Hotel',
        }),
      });

      await expect(
        routeMockRequest(`/reservations/res_mock_1/walk`, {
          method: 'POST',
          body: JSON.stringify({
            partnerHotelId: hotel.id,
            cost: 1000,
            walkedBy: 'usr_mock_1',
          }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should reject a walk to an inactive partner hotel', async () => {
      const hotel: any = await routeMockRequest('/partner-hotels', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: mockDb.properties[0].id,
          name: 'Inactive Partner Hotel',
          isActive: false,
        }),
      });

      await expect(
        routeMockRequest(`/reservations/res_mock_2/walk`, {
          method: 'POST',
          body: JSON.stringify({
            partnerHotelId: hotel.id,
            cost: 1000,
            walkedBy: 'usr_mock_1',
          }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should delete a reservation', async () => {
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(`/reservations/${resId}`, {
        method: 'DELETE',
      });
      expect(response.success).toBe(true);
    });

    it('should not update if reservation not found', async () => {
      await expect(
        routeMockRequest(`/reservations/invalid-id`, {
          method: 'PATCH',
          body: JSON.stringify({ adults: 3 }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should not check in if reservation not found', async () => {
      await expect(
        routeMockRequest(`/reservations/invalid-id/check-in`, {
          method: 'POST',
        }),
      ).rejects.toThrow(APIError);
    });

    it('should check in without updating room if room not found', async () => {
      mockDb.reservations.push({
        id: 'res_no_room',
        roomId: 'invalid',
        status: 'CONFIRMED',
      } as any);
      const response: any = await routeMockRequest(
        `/reservations/res_no_room/check-in`,
        { method: 'POST' },
      );
      expect(response.status).toBe('CHECKED_IN');
    });

    it('should check in without updating room if roomId is missing', async () => {
      mockDb.reservations.push({
        id: 'res_no_room_id',
        status: 'CONFIRMED',
      } as any);
      const response: any = await routeMockRequest(
        `/reservations/res_no_room_id/check-in`,
        { method: 'POST' },
      );
      expect(response.status).toBe('CHECKED_IN');
    });

    it('should not check out if reservation not found', async () => {
      await expect(
        routeMockRequest(`/reservations/invalid-id/check-out`, {
          method: 'POST',
        }),
      ).rejects.toThrow(APIError);
    });

    it('should check out without updating room if room not found', async () => {
      mockDb.reservations.push({
        id: 'res_no_room_out',
        roomId: 'invalid',
        status: 'CHECKED_IN',
      } as any);
      const response: any = await routeMockRequest(
        `/reservations/res_no_room_out/check-out`,
        { method: 'POST' },
      );
      expect(response.status).toBe('CHECKED_OUT');
    });

    it('should check out without updating room if roomId is missing', async () => {
      mockDb.reservations.push({
        id: 'res_no_room_id_out',
        status: 'CHECKED_IN',
      } as any);
      const response: any = await routeMockRequest(
        `/reservations/res_no_room_id_out/check-out`,
        { method: 'POST' },
      );
      expect(response.status).toBe('CHECKED_OUT');
    });
  });

  describe('Folios & Transactions', () => {
    it('should return transaction codes', async () => {
      const response: any = await routeMockRequest(
        '/folios/transactions/codes',
        { method: 'GET' },
      );
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return folios by reservation id', async () => {
      const resId = mockDb.reservations[0].id;
      const response: any = await routeMockRequest(
        `/folios/reservation/${resId}`,
        { method: 'GET' },
      );
      expect(Array.isArray(response)).toBe(true);
    });

    it('should list open folios for a property', async () => {
      const propertyId = mockDb.reservations[0].propertyId;
      const response: any = await routeMockRequest(
        `/folios?propertyId=${propertyId}&status=OPEN`,
        { method: 'GET' },
      );
      expect(Array.isArray(response)).toBe(true);
      expect(response[0].folioNumber).toBeDefined();
    });

    it('should post a transaction to a window', async () => {
      const folioId = mockDb.folios[0].id;
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 1000,
          }),
        },
      );
      expect(response.id).toBeDefined();
    });

    it('should throw 404 for invalid window when posting transaction', async () => {
      const folioId = mockDb.folios[0].id;
      await expect(
        routeMockRequest(`/folios/${folioId}/transactions`, {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 99,
            trxCodeId: 'tc_fnb',
            amountNet: 1000,
          }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 404 for invalid trx code when posting transaction', async () => {
      const folioId = mockDb.folios[0].id;
      await expect(
        routeMockRequest(`/folios/${folioId}/transactions`, {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'invalid_code',
            amountNet: 1000,
          }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should post a transaction without service or tax (PAYMENT)', async () => {
      const folioId = mockDb.folios[0].id;
      mockDb.transactionCodes.push({
        id: 'tc_none',
        hasService: false,
        hasTax: false,
        type: 'PAYMENT',
      } as any);
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_none',
            amountNet: 1000,
          }),
        },
      );
      expect(response.id).toBeDefined();
    });

    it('should handle missing win/fol objects gracefully', async () => {
      const folioId = mockDb.folios[0].id;
      // Empty folios/windows so `if (win)` and `if (fol)` evaluate to false
      mockDb.folios = [];
      mockDb.folioWindows = [
        { id: 'win1', folioId, windowNumber: 1, balance: 0 },
      ] as any;
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 1000,
          }),
        },
      );
      expect(response.id).toBeDefined();
    });
  });

  describe('Night Audit', () => {
    it('should start night audit run', async () => {
      const response: any = await routeMockRequest('/night-audit/run', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'prop_mock_1',
          businessDate: '2025-01-15T00:00:00.000Z',
        }),
      });
      expect(response.status).toBe('STARTED');
      expect(response.nightAuditId).toBeDefined();
    });

    it('should return NOT_STARTED status when missing audit', async () => {
      const response: any = await routeMockRequest(
        '/night-audit/status/prop_mock_1/2025-01-14T00:00:00.000Z',
        { method: 'GET' },
      );
      expect(response.status).toBe('NOT_STARTED');
    });

    it('should throw 400 when starting without required fields', async () => {
      await expect(
        routeMockRequest('/night-audit/run', {
          method: 'POST',
          body: JSON.stringify({ propertyId: 'prop_mock_1' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should return ALREADY_COMPLETED when run already completed', async () => {
      mockDb.nightAudits.push({
        id: 'na_completed_1',
        propertyId: 'prop_mock_1',
        businessDate: '2025-01-15T00:00:00.000Z',
        roomsPosted: 1,
        revenuePosted: 3500,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        status: 'COMPLETED',
      });

      const response: any = await routeMockRequest('/night-audit/run', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'prop_mock_1',
          businessDate: '2025-01-15T00:00:00.000Z',
        }),
      });

      expect(response.status).toBe('ALREADY_COMPLETED');
    });

    it('should return status with errors and reports when audit exists', async () => {
      mockDb.nightAudits.push({
        id: 'na_1',
        propertyId: 'prop encoded',
        businessDate: '2025-01-16T00:00:00.000Z',
        roomsPosted: 0,
        revenuePosted: 0,
        startedAt: null,
        completedAt: null,
        status: 'FAILED',
      });
      mockDb.auditErrors.push({
        id: 'ae_1',
        nightAuditId: 'na_1',
        errorType: 'PROCESSOR_FAILURE',
        description: 'boom',
        resolved: false,
      });
      mockDb.reportArchives.push({
        id: 'ra_1',
        nightAuditId: 'na_1',
        reportType: 'NIGHT_AUDIT_SUMMARY',
        reportName: 'Night Audit Summary',
      });

      const response: any = await routeMockRequest(
        '/night-audit/status/prop%20encoded/2025-01-16T00:00:00.000Z',
        { method: 'GET' },
      );

      expect(response.status).toBe('FAILED');
      expect(response.errors).toHaveLength(1);
      expect(response.reports).toHaveLength(1);
    });

    it('should 404 when status url is malformed', async () => {
      await expect(
        routeMockRequest('/night-audit/status/prop_mock_1', { method: 'GET' }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Shifts', () => {
    it('should return the seeded current OPEN shift', async () => {
      const response: any = await routeMockRequest(
        '/shifts/current?propertyId=prop_mock_1&userId=usr_mock_1',
        { method: 'GET' },
      );
      expect(response.status).toBe('OPEN');
      expect(response.userId).toBe('usr_mock_1');
    });

    it('should close a shift with zero variance as BALANCED', async () => {
      const closed: any = await routeMockRequest('/shifts/sh_mock_1/close', {
        method: 'POST',
        body: JSON.stringify({
          closingCash: 0,
          userId: 'usr_mock_1',
        }),
      });
      expect(closed.status).toBe('BALANCED');
      expect(closed.cashVariance).toBe(0);
    });

    it('should throw 409 when opening a second OPEN shift for the same user', async () => {
      await expect(
        routeMockRequest('/shifts', {
          method: 'POST',
          body: JSON.stringify({
            propertyId: 'prop_mock_1',
            userId: 'usr_mock_1',
            openingCash: 500,
          }),
        }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('should open then close a shift after the seeded one is closed', async () => {
      await routeMockRequest('/shifts/sh_mock_1/close', {
        method: 'POST',
        body: JSON.stringify({ closingCash: 0, userId: 'usr_mock_1' }),
      });

      const opened: any = await routeMockRequest('/shifts', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: 'prop_mock_1',
          userId: 'usr_mock_1',
          openingCash: 1000,
        }),
      });
      expect(opened.status).toBe('OPEN');
      expect(opened.openingCash).toBe(1000);
      expect(opened.shiftNumber).toMatch(/^SH-\d{8}-mock-\d+$/);

      const closed: any = await routeMockRequest(`/shifts/${opened.id}/close`, {
        method: 'POST',
        body: JSON.stringify({
          closingCash: 1000,
          userId: 'usr_mock_1',
        }),
      });
      expect(closed.status).toBe('BALANCED');
    });

    it('should post a folio transaction onto the open shift', async () => {
      const folioId = mockDb.folios[0].id;
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 1000,
            userId: 'CURRENT_USER',
          }),
        },
      );
      expect(response.id).toBeDefined();
      const posted = mockDb.folioTransactions.find(
        (t: any) => t.id === response.id,
      );
      expect(posted.shiftId).toBe('sh_mock_1');
    });

    it('should reject folio posting when no OPEN shift exists', async () => {
      mockDb.shifts.forEach((s: any) => {
        s.status = 'CLOSED';
      });
      const folioId = mockDb.folios[0].id;
      await expect(
        routeMockRequest(`/folios/${folioId}/transactions`, {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 1000,
          }),
        }),
      ).rejects.toMatchObject({
        status: 400,
        data: { message: 'No open shift for this user and property' },
      });
    });

    it('should 404 getCurrent when the user has no OPEN shift', async () => {
      mockDb.shifts.forEach((s: any) => {
        s.status = 'CLOSED';
      });
      await expect(
        routeMockRequest(
          '/shifts/current?propertyId=prop_mock_1&userId=usr_mock_1',
          { method: 'GET' },
        ),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('Error Handling', () => {
    it('should throw 404 for undefined routes', async () => {
      await expect(
        routeMockRequest('/undefined-route', { method: 'GET' }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 404 for unsupported methods on known routes', async () => {
      await expect(
        routeMockRequest('/properties', { method: 'PUT' }),
      ).rejects.toThrow(APIError);
      await expect(
        routeMockRequest('/rooms', { method: 'OPTIONS' }),
      ).rejects.toThrow(APIError);
      await expect(
        routeMockRequest('/reservations', { method: 'TRACE' }),
      ).rejects.toThrow(APIError);
      await expect(
        routeMockRequest('/guests', { method: 'HEAD' }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 500 APIError for parsing errors etc', async () => {
      // intentionally passing bad JSON to trigger parsing error
      await expect(
        routeMockRequest('/rooms', { method: 'POST', body: '{bad}' }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 404 for unknown financial routes', async () => {
      await expect(
        routeMockRequest('/financial/unknown', { method: 'GET' }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Folio Voiding Transactions', () => {
    it('should successfully void a transaction', async () => {
      const folioId = mockDb.folios[0].id;
      // First create a transaction to void
      const postRes: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 100,
          }),
        },
      );

      const voidRes: any = await routeMockRequest(
        `/folios/transactions/${postRes.id}/void`,
        {
          method: 'POST',
          body: JSON.stringify({
            reasonCodeId: mockDb.reasonCodes[0].id,
            remark: 'Wrong posting',
          }),
        },
      );

      expect(voidRes.id).toBeDefined();

      // Attempt to void it again to trigger 400 Already voided
      await expect(
        routeMockRequest(`/folios/transactions/${postRes.id}/void`, {
          method: 'POST',
          body: JSON.stringify({ reasonCodeId: mockDb.reasonCodes[0].id }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should successfully void a transaction without a remark', async () => {
      const folioId = mockDb.folios[0].id;
      const postRes: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 100,
          }),
        },
      );

      const voidRes: any = await routeMockRequest(
        `/folios/transactions/${postRes.id}/void`,
        {
          method: 'POST',
          body: JSON.stringify({ reasonCodeId: mockDb.reasonCodes[0].id }), // no remark
        },
      );

      expect(voidRes.id).toBeDefined();
    });

    it('should throw 404 if transaction to void is not found', async () => {
      await expect(
        routeMockRequest(`/folios/transactions/invalid-tx/void`, {
          method: 'POST',
          body: JSON.stringify({ reasonCodeId: mockDb.reasonCodes[0].id }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 400 if reasonCodeId is missing when voiding', async () => {
      const folioId = mockDb.folios[0].id;
      const postRes: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 50,
          }),
        },
      );

      await expect(
        routeMockRequest(`/folios/transactions/${postRes.id}/void`, {
          method: 'POST',
          body: JSON.stringify({ remark: 'Test' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('should throw 400 if reasonCode is inactive or invalid', async () => {
      const folioId = mockDb.folios[0].id;
      const postRes: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 50,
          }),
        },
      );

      mockDb.reasonCodes.push({
        id: 'inactive_reason',
        isActive: false,
      } as any);

      await expect(
        routeMockRequest(`/folios/transactions/${postRes.id}/void`, {
          method: 'POST',
          body: JSON.stringify({ reasonCodeId: 'inactive_reason' }),
        }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Financial Configuration', () => {
    it('should return transaction codes from financial path', async () => {
      const response: any = await routeMockRequest(
        '/financial/transaction-codes',
        { method: 'GET' },
      );
      expect(Array.isArray(response)).toBe(true);
    });

    it('should return reason codes from financial path', async () => {
      const response: any = await routeMockRequest('/financial/reason-codes', {
        method: 'GET',
      });
      expect(Array.isArray(response)).toBe(true);
    });
  });

  describe('Exchange rates', () => {
    it('lists active exchange rates', async () => {
      const response: any = await routeMockRequest('/exchange-rates', {
        method: 'GET',
      });
      expect(response.length).toBeGreaterThan(0);
      expect(response[0].targetCurrency).toBe('USD');
    });

    it('looks up the latest rate on or before the requested date', async () => {
      mockDb.exchangeRates.push({
        id: 'fx_old',
        baseCurrency: 'THB',
        targetCurrency: 'USD',
        rate: 30,
        effectiveDate: '2019-01-01',
        isActive: true,
        createdAt: '2019-01-01',
      });
      const response: any = await routeMockRequest(
        '/exchange-rates?baseCurrency=THB&targetCurrency=USD&date=2026-08-14',
        { method: 'GET' },
      );
      expect(response.rate).toBe(35);
    });

    it('creates an exchange rate and rejects unique conflicts', async () => {
      const created: any = await routeMockRequest('/exchange-rates', {
        method: 'POST',
        body: JSON.stringify({
          baseCurrency: 'THB',
          targetCurrency: 'EUR',
          rate: 38,
          effectiveDate: '2026-08-14',
        }),
      });
      expect(created.targetCurrency).toBe('EUR');
      expect(created.rate).toBe(38);

      await expect(
        routeMockRequest('/exchange-rates', {
          method: 'POST',
          body: JSON.stringify({
            baseCurrency: 'THB',
            targetCurrency: 'EUR',
            rate: 39,
            effectiveDate: '2026-08-14',
          }),
        }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('patches rate and isActive', async () => {
      const response: any = await routeMockRequest(
        '/exchange-rates/fx_mock_1',
        {
          method: 'PATCH',
          body: JSON.stringify({ rate: 36.5, isActive: false }),
        },
      );
      expect(response.rate).toBe(36.5);
      expect(response.isActive).toBe(false);
    });

    it('converts cash 9000 posts using the guest currency rate', async () => {
      const folioId = mockDb.folios[0].id;
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_cash_9000',
            amountNet: 0,
            currency: 'USD',
            foreignAmount: 100,
            businessDate: '2026-08-14',
          }),
        },
      );
      const posted = mockDb.folioTransactions.find(
        (trx: any) => trx.id === response.id,
      );
      expect(posted.amountNet).toBe(3500);
      expect(posted.reference).toBe('FX USD 100 @ 35.0000');
    });

    it('ignores currency on non-9000 posts', async () => {
      const folioId = mockDb.folios[0].id;
      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 200,
            currency: 'USD',
            foreignAmount: 100,
          }),
        },
      );
      const posted = mockDb.folioTransactions.find(
        (trx: any) => trx.id === response.id,
      );
      expect(posted.amountNet).toBe(200);
    });
  });

  describe('Tax invoices', () => {
    it('issues a snapshot invoice and voids with a reason', async () => {
      const issued: any = await routeMockRequest('/tax-invoices', {
        method: 'POST',
        body: JSON.stringify({
          folioId: mockDb.folios[0].id,
          taxId: '1234567890123',
          issuedBy: 'usr_mock_1',
        }),
      });
      expect(issued.invoiceNumber).toMatch(/^TI-\d{4}-\d{6}$/);
      expect(issued.amountNet).toBe(2500);
      expect(issued.amountTotal).toBe(2942.5);

      await expect(
        routeMockRequest('/tax-invoices', {
          method: 'POST',
          body: JSON.stringify({
            folioId: mockDb.folios[0].id,
            taxId: '1234567890123',
            issuedBy: 'usr_mock_1',
          }),
        }),
      ).rejects.toMatchObject({ status: 409 });

      const listed: any = await routeMockRequest(
        `/tax-invoices?propertyId=${mockDb.properties[0].id}`,
        { method: 'GET' },
      );
      expect(listed.length).toBeGreaterThan(0);

      const voided: any = await routeMockRequest(
        `/tax-invoices/${issued.id}/void`,
        {
          method: 'POST',
          body: JSON.stringify({
            reason: 'Wrong tax id',
            voidedBy: 'usr_mock_1',
          }),
        },
      );
      expect(voided.status).toBe('VOID');
      expect(voided.voidReason).toBe('Wrong tax id');
    });
  });

  describe('AR accounts', () => {
    it('creates an account, transfers a folio, and allocates a payment', async () => {
      const account: any = await routeMockRequest('/ar-accounts', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: mockDb.properties[0].id,
          companyName: 'Acme Co',
          creditLimit: 50000,
          paymentTerms: 30,
        }),
      });
      expect(account.accountNumber).toMatch(/^AR-\d{6}$/);

      const folio = {
        id: 'fol_mock_ar',
        reservationId: 'res_mock_1',
        folioNumber: 'F-AR-1',
        type: 'GUEST',
        status: 'OPEN',
        balance: 250,
        businessDate: '2026-08-14',
        isClosed: false,
      };
      mockDb.folios.push(folio);
      mockDb.folioWindows.push({
        id: 'fw_mock_ar',
        folioId: folio.id,
        windowNumber: 1,
        balance: 250,
      });

      const invoice: any = await routeMockRequest(
        `/ar-accounts/${account.id}/transfer`,
        {
          method: 'POST',
          body: JSON.stringify({
            folioId: folio.id,
            userId: 'usr_mock_1',
          }),
        },
      );
      expect(invoice.invoiceNumber).toMatch(/^AR-\d{4}-\d{6}$/);
      expect(invoice.amount).toBe(250);
      expect(folio.status).toBe('POSTED_TO_CITY_LEDGER');
      expect(account.currentBalance).toBe(250);

      const paid: any = await routeMockRequest(
        `/ar-invoices/${invoice.id}/payments`,
        {
          method: 'POST',
          body: JSON.stringify({
            amount: 50,
            method: 'BANK_TRANSFER',
            paidBy: 'usr_mock_1',
            businessDate: '2026-08-14',
          }),
        },
      );
      expect(paid.status).toBe('PARTIAL');
      expect(paid.paidAmount).toBe(50);
      expect(account.currentBalance).toBe(200);

      const aging: any = await routeMockRequest(
        `/ar-accounts/${account.id}/aging?asOf=2026-08-14`,
        { method: 'GET' },
      );
      expect(aging.current).toBe(200);
    });
  });

  describe('AR auto-settlement', () => {
    it('blocks a charge that would exceed linked AR credit', async () => {
      const account: any = await routeMockRequest('/ar-accounts', {
        method: 'POST',
        body: JSON.stringify({
          propertyId: mockDb.properties[0].id,
          companyName: 'Limit Co',
          creditLimit: 10,
        }),
      });
      const folioId = mockDb.folios[0].id;
      await routeMockRequest(`/folios/${folioId}/ar-account`, {
        method: 'PATCH',
        body: JSON.stringify({ arAccountId: account.id }),
      });
      await expect(
        routeMockRequest(`/folios/${folioId}/transactions`, {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 200,
            userId: 'usr_mock_1',
            businessDate: '2026-08-14',
          }),
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('Folio credit limit', () => {
    it('blocks checkout when the folio is over its credit limit', async () => {
      const folioId = mockDb.folios[0].id;
      await routeMockRequest(`/folios/${folioId}/credit-limit`, {
        method: 'PATCH',
        body: JSON.stringify({ creditLimit: 1 }),
      });

      await expect(
        routeMockRequest(`/folios/${folioId}/checkout`, {
          method: 'POST',
          body: JSON.stringify({ userId: 'usr_mock_1' }),
        }),
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe('Folio post-departure charges', () => {
    it('rejects posting to a closed folio', async () => {
      const folioId = mockDb.folios[0].id;
      await routeMockRequest(`/folios/${folioId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ userId: 'usr_mock_1' }),
      });

      await expect(
        routeMockRequest(`/folios/${folioId}/transactions`, {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 200,
            userId: 'usr_mock_1',
            businessDate: '2026-08-14',
          }),
        }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('rejects reopening a folio that is not closed', async () => {
      const folioId = mockDb.folios[0].id;
      await expect(
        routeMockRequest(`/folios/${folioId}/reopen`, { method: 'POST' }),
      ).rejects.toMatchObject({ status: 409 });
    });

    it('reopens a closed folio and allows posting again', async () => {
      const folioId = mockDb.folios[0].id;
      await routeMockRequest(`/folios/${folioId}/checkout`, {
        method: 'POST',
        body: JSON.stringify({ userId: 'usr_mock_1' }),
      });

      const reopened: any = await routeMockRequest(
        `/folios/${folioId}/reopen`,
        { method: 'POST' },
      );
      expect(reopened.status).toBe('OPEN');
      expect(reopened.isClosed).toBe(false);

      const response: any = await routeMockRequest(
        `/folios/${folioId}/transactions`,
        {
          method: 'POST',
          body: JSON.stringify({
            windowNumber: 1,
            trxCodeId: 'tc_fnb',
            amountNet: 200,
            userId: 'usr_mock_1',
            businessDate: '2026-08-14',
          }),
        },
      );
      expect(response.id).toBeDefined();
    });
  });

  describe('Card pre-auths', () => {
    it('holds, increments, and captures as a card payment', async () => {
      const held: any = await routeMockRequest('/card-preauths', {
        method: 'POST',
        body: JSON.stringify({
          reservationId: mockDb.reservations[0].id,
          amount: 500,
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2028,
          manualRef: 'AUTH-1',
          createdBy: 'usr_mock_1',
        }),
      });
      expect(held.status).toBe('HELD');

      const increased: any = await routeMockRequest(
        `/card-preauths/${held.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ amount: 700 }),
        },
      );
      expect(increased.status).toBe('INCREMENTAL');
      expect(increased.amount).toBe(700);

      const captured: any = await routeMockRequest(
        `/card-preauths/${held.id}/capture`,
        {
          method: 'POST',
          body: JSON.stringify({
            folioId: mockDb.folios[0].id,
            userId: 'usr_mock_1',
          }),
        },
      );
      expect(captured.status).toBe('CAPTURED');
    });
  });

  describe('Partner hotels', () => {
    it('creates, lists, and updates a partner hotel', async () => {
      const propertyId = mockDb.properties[0].id;
      const created: any = await routeMockRequest('/partner-hotels', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          name: 'Grand Partner Hotel',
          phone: '02-000-0000',
        }),
      });
      expect(created.isActive).toBe(true);

      const list: any = await routeMockRequest(
        `/partner-hotels?propertyId=${propertyId}`,
        { method: 'GET' },
      );
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(created.id);

      const fetched: any = await routeMockRequest(
        `/partner-hotels/${created.id}`,
        { method: 'GET' },
      );
      expect(fetched.name).toBe('Grand Partner Hotel');

      const updated: any = await routeMockRequest(
        `/partner-hotels/${created.id}`,
        { method: 'PATCH', body: JSON.stringify({ isActive: false }) },
      );
      expect(updated.isActive).toBe(false);
    });

    it('rejects a duplicate partner hotel name for the same property', async () => {
      const propertyId = mockDb.properties[0].id;
      await routeMockRequest('/partner-hotels', {
        method: 'POST',
        body: JSON.stringify({ propertyId, name: 'Duplicate Hotel' }),
      });

      await expect(
        routeMockRequest('/partner-hotels', {
          method: 'POST',
          body: JSON.stringify({ propertyId, name: 'Duplicate Hotel' }),
        }),
      ).rejects.toThrow(APIError);
    });

    it('throws 404 for an unknown partner hotel', async () => {
      await expect(
        routeMockRequest('/partner-hotels/missing', { method: 'GET' }),
      ).rejects.toThrow(APIError);
    });
  });

  describe('Rates', () => {
    it('creates a parent and derives a child amount', async () => {
      const propertyId = mockDb.properties[0].id;
      const roomTypeId = mockDb.roomTypes[0].id;
      const parent: any = await routeMockRequest('/rates', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          roomTypeId,
          code: 'BAR',
          name: 'Best Available',
          amount: 1500,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      });
      expect(parent.amount).toBe(1500);

      const child: any = await routeMockRequest('/rates', {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          roomTypeId,
          code: 'CORP',
          name: 'Corporate',
          parentRateId: parent.id,
          deriveMode: 'PERCENT_OFFSET',
          deriveValue: -10,
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        }),
      });
      expect(child.amount).toBe(1350);

      await routeMockRequest(`/rates/${parent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ amount: 2000 }),
      });
      const childAfter = mockDb.rates.find((row: any) => row.id === child.id);
      expect(childAfter.amount).toBe(1800);
    });

    it('throws 404 for an unknown rate', async () => {
      await expect(
        routeMockRequest('/rates/missing', { method: 'GET' }),
      ).rejects.toThrow(APIError);
    });
  });
});
