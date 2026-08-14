import { renderStatementHtml } from './statement-html';

describe('renderStatementHtml', () => {
  it('escapes company names and lists open amounts', () => {
    const html = renderStatementHtml({
      accountNumber: 'AR-000001',
      companyName: 'Acme <Corp>',
      asOf: '2026-08-14',
      currentBalance: 80,
      aging: { current: 80, days30: 0, days60: 0, days90: 0 },
      invoices: [
        {
          invoiceNumber: 'AR-2026-000001',
          invoiceDate: '2026-08-01',
          dueDate: '2026-08-31',
          amount: 100,
          paidAmount: 20,
          status: 'PARTIAL',
        },
      ],
    });

    expect(html).toContain('Acme &lt;Corp&gt;');
    expect(html).toContain('80.00');
    expect(html).toContain('AR-2026-000001');
  });
});
