import { summarizeTrialBalance } from './reports-trial-balance';

describe('summarizeTrialBalance', () => {
  it('should group debit and credit by account code', () => {
    const result = summarizeTrialBalance([
      {
        debit: 150,
        credit: 0,
        account: { code: '1100', name: 'AR' },
      },
      {
        debit: 0,
        credit: 100,
        account: { code: '4000-01', name: 'Room' },
      },
      {
        debit: 0,
        credit: 50,
        account: { code: '4000-01', name: 'Room' },
      },
    ]);

    expect(result.rows).toEqual([
      { accountCode: '1100', accountName: 'AR', debit: 150, credit: 0 },
      {
        accountCode: '4000-01',
        accountName: 'Room',
        debit: 0,
        credit: 150,
      },
    ]);
    expect(result.totalDebit).toBe(150);
    expect(result.totalCredit).toBe(150);
  });
});
