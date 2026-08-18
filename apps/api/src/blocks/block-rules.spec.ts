import { describe, expect, it } from 'vitest';
import {
  BLOCK_CUTOFF_MESSAGE,
  BLOCK_DATE_MESSAGE,
  assertBlockDates,
  datesOverlap,
  isPastCutoff,
  remainingRooms,
} from './block-rules';

describe('block-rules', () => {
  it('computes remaining rooms after pickup and release', () => {
    expect(remainingRooms(10, 2, 3)).toBe(5);
    expect(remainingRooms(5, 4, 3)).toBe(0);
  });

  it('treats cutoff as due on the business date', () => {
    expect(
      isPastCutoff(
        new Date('2026-08-18T00:00:00.000Z'),
        new Date('2026-08-18T00:00:00.000Z'),
      ),
    ).toBe(true);
    expect(
      isPastCutoff(
        new Date('2026-08-19T00:00:00.000Z'),
        new Date('2026-08-18T00:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('rejects inverted dates and cutoff after end', () => {
    expect(assertBlockDates('2026-08-20', '2026-08-18', '2026-08-17')).toBe(
      BLOCK_DATE_MESSAGE,
    );
    expect(assertBlockDates('2026-08-18', '2026-08-20', '2026-08-21')).toBe(
      BLOCK_CUTOFF_MESSAGE,
    );
    expect(assertBlockDates('2026-08-18', '2026-08-18', '2026-08-17')).toBe(
      BLOCK_DATE_MESSAGE,
    );
    expect(
      assertBlockDates('2026-08-18', '2026-08-20', '2026-08-18'),
    ).toBeNull();
  });

  it('detects overlapping stay windows', () => {
    expect(
      datesOverlap(
        new Date('2026-08-18T00:00:00.000Z'),
        new Date('2026-08-20T00:00:00.000Z'),
        new Date('2026-08-19T00:00:00.000Z'),
        new Date('2026-08-21T00:00:00.000Z'),
      ),
    ).toBe(true);
    expect(
      datesOverlap(
        new Date('2026-08-18T00:00:00.000Z'),
        new Date('2026-08-19T00:00:00.000Z'),
        new Date('2026-08-19T00:00:00.000Z'),
        new Date('2026-08-21T00:00:00.000Z'),
      ),
    ).toBe(false);
  });
});
