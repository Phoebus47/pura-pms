import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import {
  assertCanClaim,
  assertCanDispose,
  assertCanReturn,
  isRetentionOverdue,
  retentionEndsAt,
} from './lost-found-rules';

describe('lost-found-rules', () => {
  it('allows claim and dispose only while FOUND', () => {
    expect(() => assertCanClaim('FOUND')).not.toThrow();
    expect(() => assertCanDispose('FOUND')).not.toThrow();
    expect(() => assertCanClaim('CLAIMED')).toThrow(BadRequestException);
    expect(() => assertCanDispose('RETURNED')).toThrow(BadRequestException);
  });

  it('allows return only while CLAIMED', () => {
    expect(() => assertCanReturn('CLAIMED')).not.toThrow();
    expect(() => assertCanReturn('FOUND')).toThrow(BadRequestException);
  });

  it('flags FOUND items past the retention window', () => {
    const foundAt = new Date('2026-01-01T00:00:00.000Z');
    const now = new Date('2026-08-01T00:00:00.000Z');
    expect(isRetentionOverdue('FOUND', foundAt, 90, now)).toBe(true);
    expect(isRetentionOverdue('CLAIMED', foundAt, 90, now)).toBe(false);
    expect(retentionEndsAt(foundAt, 90).toISOString()).toBe(
      '2026-04-01T00:00:00.000Z',
    );
  });
});
