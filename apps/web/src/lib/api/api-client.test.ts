/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import { propertiesAPI } from './properties';
import { roomsAPI } from './rooms';
import { guestsAPI } from './guests';
import { reservationsAPI } from './reservations';
import { roomTypesAPI } from './room-types';

vi.mock('./client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  getAuthToken: vi.fn().mockReturnValue('mock-token'),
}));

describe('API Client Wrappers', () => {
  const mockToken = 'mock-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Properties API', () => {
    it('getAll calls client.get', async () => {
      await propertiesAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/properties', mockToken);
    });
    it('getById calls client.get', async () => {
      await propertiesAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/properties/1', mockToken);
    });
    it('create calls client.post', async () => {
      const data = { name: 'Test', currency: 'USD', timezone: 'UTC' };
      await propertiesAPI.create(data);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/properties',
        data,
        mockToken,
      );
    });
    it('update calls client.patch', async () => {
      await propertiesAPI.update('1', { name: 'New' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/properties/1',
        { name: 'New' },
        mockToken,
      );
    });
    it('delete calls client.delete', async () => {
      await propertiesAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/properties/1', mockToken);
    });
  });

  describe('Rooms API', () => {
    it('getAll passes no params', async () => {
      await roomsAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/rooms', mockToken);
    });

    it('getAll passes single query param', async () => {
      await roomsAPI.getAll({ status: 'VACANT_CLEAN' });
      const lastCall = (apiClient.get as any).mock.calls[0][0];
      expect(lastCall).toContain('status=VACANT_CLEAN');
      expect(lastCall).not.toContain('propertyId');
    });

    it('getAll passes query params', async () => {
      await roomsAPI.getAll({
        status: 'VACANT_CLEAN',
        propertyId: 'p1',
        roomTypeId: 'rt1',
      });
      const lastCall = (apiClient.get as any).mock.calls[0][0];
      // Check query string components (order agnostic)
      expect(lastCall).toContain('/rooms?');
      expect(lastCall).toContain('status=VACANT_CLEAN');
      expect(lastCall).toContain('propertyId=p1');
      expect(lastCall).toContain('roomTypeId=rt1');
    });

    it('updateStatus calls patch', async () => {
      await roomsAPI.updateStatus('1', 'OCCUPIED_DIRTY');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/rooms/1/status',
        { status: 'OCCUPIED_DIRTY' },
        mockToken,
      );
    });

    it('checkAvailability passes params', async () => {
      const params = {
        propertyId: 'p1',
        checkIn: '2024-01-01',
        checkOut: '2024-01-02',
        roomTypeId: 'rt1',
      };
      await roomsAPI.checkAvailability(params);
      const lastCall = (apiClient.get as any).mock.calls[0][0];
      expect(lastCall).toContain('checkIn=2024-01-01');
      expect(lastCall).toContain('roomTypeId=rt1');
    });

    it('CRUD methods', async () => {
      await roomsAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/rooms/1', mockToken);

      await roomsAPI.create({ number: '101' } as any);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/rooms',
        expect.objectContaining({ number: '101' }),
        mockToken,
      );

      await roomsAPI.update('1', { number: '102' } as any);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/rooms/1',
        expect.objectContaining({ number: '102' }),
        mockToken,
      );

      await roomsAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/rooms/1', mockToken);
    });
  });

  describe('Guests API', () => {
    it('getAll calls get without params', async () => {
      await guestsAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/guests', mockToken);
    });

    it('getAll calls get with explicit params', async () => {
      await guestsAPI.getAll({ search: 'John', limit: 20 });
      const lastCall = (apiClient.get as any).mock.calls[0][0];
      expect(lastCall).toContain('search=John');
      expect(lastCall).toContain('limit=20');
    });

    it('search calls getAll with params', async () => {
      await guestsAPI.getAll({ search: 'John' });
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=John'),
        mockToken,
      );
    });

    it('toggleBlacklist calls patch', async () => {
      await guestsAPI.toggleBlacklist('g1');
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/g1/blacklist',
        {},
        mockToken,
      );
    });

    it('CRUD methods', async () => {
      await guestsAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/guests/1', mockToken);

      await guestsAPI.create({ firstName: 'John' } as any);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/guests',
        expect.anything(),
        mockToken,
      );

      await guestsAPI.update('1', { firstName: 'Jane' });
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/guests/1',
        expect.anything(),
        mockToken,
      );

      await guestsAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/guests/1', mockToken);
    });
  });

  describe('Reservations API', () => {
    describe('getAll', () => {
      it('calls get without params', async () => {
        await reservationsAPI.getAll();
        expect(apiClient.get).toHaveBeenCalledWith('/reservations');
      });

      it('calls get with single filter', async () => {
        await reservationsAPI.getAll({ status: 'CONFIRMED' });
        expect(apiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('status=CONFIRMED'),
        );
      });

      it('calls get with multiple filters', async () => {
        await reservationsAPI.getAll({
          propertyId: 'p1',
          checkIn: '2024-01-01',
          checkOut: '2024-01-02',
          guestId: 'g1',
        });
        const lastCall = (apiClient.get as any).mock.calls[0][0];
        expect(lastCall).toContain('propertyId=p1');
        expect(lastCall).toContain('checkIn=2024-01-01');
        expect(lastCall).toContain('checkOut=2024-01-02');
        expect(lastCall).toContain('guestId=g1');
      });
    });

    it('getByConfirmNumber calls get', async () => {
      await reservationsAPI.getByConfirmNumber('CN123');
      expect(apiClient.get).toHaveBeenCalledWith('/reservations/confirm/CN123');
    });

    describe('getCalendar', () => {
      it('calls get with required params', async () => {
        await reservationsAPI.getCalendar({
          propertyId: 'p1',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
        const lastCall = (apiClient.get as any).mock.calls[0][0];
        expect(lastCall).toContain('/reservations/calendar?');
        expect(lastCall).toContain('propertyId=p1');
        expect(lastCall).toContain('startDate=2024-01-01');
        expect(lastCall).toContain('endDate=2024-01-31');
        expect(lastCall).not.toContain('roomTypeId');
      });

      it('calls get with optional roomTypeId', async () => {
        await reservationsAPI.getCalendar({
          propertyId: 'p1',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          roomTypeId: 'rt1',
        });
        const lastCall = (apiClient.get as any).mock.calls[0][0];
        expect(lastCall).toContain('roomTypeId=rt1');
      });
    });

    it('checkIn calls post', async () => {
      await reservationsAPI.checkIn('r1');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/reservations/r1/check-in',
        {},
      );
    });

    it('checkOut calls post', async () => {
      await reservationsAPI.checkOut('r1');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/reservations/r1/check-out',
        {},
      );
    });

    it('cancel calls patch with reason', async () => {
      await reservationsAPI.cancel('r1', 'reason');
      expect(apiClient.patch).toHaveBeenCalledWith('/reservations/r1/cancel', {
        reason: 'reason',
      });
    });

    it('CRUD methods', async () => {
      await reservationsAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/reservations/1');

      await reservationsAPI.create({ guestId: 'g1' } as any);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/reservations',
        expect.anything(),
      );

      await reservationsAPI.update('1', { status: 'CONFIRMED' } as any);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/reservations/1',
        expect.anything(),
      );

      await reservationsAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/reservations/1');
    });
  });

  describe('Room Types API', () => {
    it('getAll calls get', async () => {
      await roomTypesAPI.getAll();
      expect(apiClient.get).toHaveBeenCalledWith('/room-types', mockToken);
    });

    it('CRUD methods', async () => {
      await roomTypesAPI.getById('1');
      expect(apiClient.get).toHaveBeenCalledWith('/room-types/1', mockToken);

      await roomTypesAPI.create({ name: 'D' } as any);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/room-types',
        expect.anything(),
        mockToken,
      );

      await roomTypesAPI.update('1', { name: 'E' } as any);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/room-types/1',
        expect.anything(),
        mockToken,
      );

      await roomTypesAPI.delete('1');
      expect(apiClient.delete).toHaveBeenCalledWith('/room-types/1', mockToken);
    });
  });
});
