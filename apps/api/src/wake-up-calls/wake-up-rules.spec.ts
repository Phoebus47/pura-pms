import { BadRequestException } from '@nestjs/common';
import {
  assertSchedulableReservation,
  assertScheduledStatus,
  toScheduledDate,
} from './wake-up-rules';

describe('wake-up-rules', () => {
  it('allows confirmed and checked-in reservations', () => {
    expect(() => assertSchedulableReservation('CONFIRMED')).not.toThrow();
    expect(() => assertSchedulableReservation('CHECKED_IN')).not.toThrow();
    expect(() => assertSchedulableReservation('CANCELLED')).toThrow(
      BadRequestException,
    );
  });

  it('requires scheduled status for updates', () => {
    expect(() => assertScheduledStatus('SCHEDULED')).not.toThrow();
    expect(() => assertScheduledStatus('COMPLETED')).toThrow(
      BadRequestException,
    );
  });

  it('extracts UTC calendar date', () => {
    const date = toScheduledDate(new Date('2026-08-19T06:30:00.000Z'));
    expect(date.toISOString().slice(0, 10)).toBe('2026-08-19');
  });
});
