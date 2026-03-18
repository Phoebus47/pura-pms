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
});
