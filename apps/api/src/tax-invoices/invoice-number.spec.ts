import {
  formatInvoiceNumber,
  invoiceYearPrefix,
  nextInvoiceNumber,
  toYmd,
} from './invoice-number';

describe('invoice-number', () => {
  it('should extract YYYY-MM-DD from a Date', () => {
    expect(toYmd(new Date('2026-08-14T00:00:00.000Z'))).toBe('2026-08-14');
  });

  it('should build a year prefix', () => {
    expect(invoiceYearPrefix('2026-08-14')).toBe('TI-2026-');
  });

  it('should pad sequence to six digits', () => {
    expect(formatInvoiceNumber('2026', 3)).toBe('TI-2026-000003');
  });

  it('should increment from matching count', async () => {
    const number = await nextInvoiceNumber(
      () => Promise.resolve(2),
      '2026-08-14',
    );
    expect(number).toBe('TI-2026-000003');
  });
});
