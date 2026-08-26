import {
  defaultExpiresAt,
  generateMockToken,
  isIssuableReservationStatus,
} from './dk-rules';

describe('dk-rules', () => {
  describe('isIssuableReservationStatus', () => {
    it('allows CONFIRMED and CHECKED_IN', () => {
      expect(isIssuableReservationStatus('CONFIRMED')).toBe(true);
      expect(isIssuableReservationStatus('CHECKED_IN')).toBe(true);
    });

    it('rejects other statuses', () => {
      expect(isIssuableReservationStatus('CHECKED_OUT')).toBe(false);
      expect(isIssuableReservationStatus('CANCELLED')).toBe(false);
      expect(isIssuableReservationStatus('NO_SHOW')).toBe(false);
    });
  });

  describe('generateMockToken', () => {
    it('produces a unique DK-MOCK-prefixed token each call', () => {
      const first = generateMockToken();
      const second = generateMockToken();
      expect(first).toMatch(/^DK-MOCK-[0-9A-F]{24}$/);
      expect(second).toMatch(/^DK-MOCK-[0-9A-F]{24}$/);
      expect(first).not.toBe(second);
    });
  });

  describe('defaultExpiresAt', () => {
    it('returns the reservation checkout time', () => {
      const checkOut = new Date('2026-08-20T12:00:00.000Z');
      expect(defaultExpiresAt(checkOut).toISOString()).toBe(
        checkOut.toISOString(),
      );
    });
  });
});
