import {
  addToAging,
  agingBucket,
  daysPastDue,
  emptyAging,
  outstandingOf,
} from './aging';

describe('aging', () => {
  it('treats invoices not yet due as current', () => {
    expect(agingBucket('2026-08-20', '2026-08-14')).toBe('current');
    expect(daysPastDue('2026-08-14', '2026-08-14')).toBe(0);
  });

  it('buckets overdue invoices by 30/60/90 days', () => {
    expect(agingBucket('2026-07-20', '2026-08-14')).toBe('days30');
    expect(agingBucket('2026-06-20', '2026-08-14')).toBe('days60');
    expect(agingBucket('2026-05-01', '2026-08-14')).toBe('days90');
  });

  it('accumulates outstanding into the matching bucket', () => {
    const totals = addToAging(emptyAging(), 'days30', 100.555);
    expect(totals.days30).toBe(100.56);
    expect(outstandingOf(500, 120.5)).toBe(379.5);
  });
});
