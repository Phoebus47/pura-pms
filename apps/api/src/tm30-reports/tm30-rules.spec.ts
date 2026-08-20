import { describe, expect, it } from 'vitest';
import {
  classifyGuestForTm30,
  dueAtFromArrival,
  formatTm30Tsv,
  isOverdue,
  isThaiNationality,
} from './tm30-rules';

describe('tm30-rules', () => {
  it('treats TH / THA / THAI as Thai nationals', () => {
    expect(isThaiNationality('TH')).toBe(true);
    expect(isThaiNationality('thai')).toBe(true);
    expect(isThaiNationality('US')).toBe(false);
  });

  it('skips guests missing nationality or passport', () => {
    expect(classifyGuestForTm30({ nationality: null, idNumber: 'P1' })).toBe(
      'MISSING_NATIONALITY',
    );
    expect(classifyGuestForTm30({ nationality: 'TH', idNumber: 'P1' })).toBe(
      'THAI_NATIONAL',
    );
    expect(classifyGuestForTm30({ nationality: 'US', idNumber: '' })).toBe(
      'MISSING_PASSPORT',
    );
    expect(classifyGuestForTm30({ nationality: 'US', idNumber: 'P1' })).toBe(
      null,
    );
  });

  it('marks pending rows overdue after dueAt', () => {
    const dueAt = new Date('2026-08-19T00:00:00.000Z');
    const now = new Date('2026-08-20T00:00:00.000Z');
    expect(isOverdue('PENDING', dueAt, now)).toBe(true);
    expect(isOverdue('SUBMITTED', dueAt, now)).toBe(false);
    expect(
      dueAtFromArrival(new Date('2026-08-19T10:00:00.000Z')).toISOString(),
    ).toBe('2026-08-20T10:00:00.000Z');
  });

  it('formats a TSV header and row', () => {
    const text = formatTm30Tsv([
      {
        passportNumber: 'P1',
        fullName: 'Ann Guest',
        nationality: 'US',
        dateOfBirth: '1990-01-01',
        roomNumber: '101',
        arrivalDate: '2026-08-20',
        departureDate: '2026-08-22',
        addressInThailand: 'Bangkok',
      },
    ]);
    expect(text.startsWith('PASSPORT\tFULL_NAME')).toBe(true);
    expect(text).toContain('P1\tAnn Guest\tUS');
  });
});
