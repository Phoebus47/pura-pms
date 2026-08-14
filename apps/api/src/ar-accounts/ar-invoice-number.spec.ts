import {
  formatAccountNumber,
  formatInvoiceNumber,
  invoiceYearPrefix,
  nextInvoiceNumber,
} from './ar-invoice-number';

describe('ar-invoice-number', () => {
  it('should build a year prefix', () => {
    expect(invoiceYearPrefix('2026-08-14')).toBe('AR-2026-');
  });

  it('should pad invoice and account sequences', () => {
    expect(formatInvoiceNumber('2026', 3)).toBe('AR-2026-000003');
    expect(formatAccountNumber(4)).toBe('AR-000004');
  });

  it('should increment from matching count', async () => {
    const number = await nextInvoiceNumber(
      () => Promise.resolve(2),
      '2026-08-14',
    );
    expect(number).toBe('AR-2026-000003');
  });
});
