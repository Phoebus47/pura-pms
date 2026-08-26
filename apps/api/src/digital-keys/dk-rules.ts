import { randomBytes } from 'crypto';

export const DIGITAL_KEY_TRANSPORTS = ['BLE', 'NFC'] as const;
export type DigitalKeyTransport = (typeof DIGITAL_KEY_TRANSPORTS)[number];

export const DIGITAL_KEY_STATUSES = ['ACTIVE', 'REVOKED', 'EXPIRED'] as const;
export type DigitalKeyStatus = (typeof DIGITAL_KEY_STATUSES)[number];

const ISSUABLE_RESERVATION_STATUSES = new Set(['CONFIRMED', 'CHECKED_IN']);

export const DK_RESERVATION_NOT_ISSUABLE_MESSAGE =
  'Digital keys can only be issued for confirmed or checked-in reservations';
export const DK_ROOM_REQUIRED_MESSAGE =
  'Reservation must have a room assigned to issue a digital key';
export const DK_NOT_ACTIVE_MESSAGE = 'Only active digital keys can be revoked';
export const DK_CONFIRM_NUMBER_REQUIRED_MESSAGE = 'confirmNumber is required';

export function isIssuableReservationStatus(status: string): boolean {
  return ISSUABLE_RESERVATION_STATUSES.has(status);
}

/**
 * Mock credential token — stands in for the payload a real BLE/NFC
 * mobile-key SDK would issue (see ADR 021). Not cryptographically bound to
 * any lock hardware.
 */
export function generateMockToken(): string {
  return `DK-MOCK-${randomBytes(12).toString('hex').toUpperCase()}`;
}

export function defaultExpiresAt(checkOut: Date): Date {
  return new Date(checkOut);
}
