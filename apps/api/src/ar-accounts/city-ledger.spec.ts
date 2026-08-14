import { InvoiceStatus } from '@pura/database';
import { addDaysUtc, statusAfterPayment } from './city-ledger';

describe('city-ledger helpers', () => {
  it('adds payment terms in UTC date-only units', () => {
    expect(addDaysUtc('2026-08-14', 30).toISOString()).toBe(
      '2026-09-13T00:00:00.000Z',
    );
  });

  it('maps paid amounts onto invoice status', () => {
    expect(statusAfterPayment(100, 0)).toBe(InvoiceStatus.OPEN);
    expect(statusAfterPayment(100, 40)).toBe(InvoiceStatus.PARTIAL);
    expect(statusAfterPayment(100, 100)).toBe(InvoiceStatus.PAID);
  });
});
