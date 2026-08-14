import { computeCashTotals, round2 } from './shift-cash';

describe('shift-cash', () => {
  it('should round to two decimal places', () => {
    expect(round2(1.005)).toBe(1);
    expect(round2(10.125)).toBe(10.13);
  });

  it('should increase expected cash for 9000 payment sign -1', () => {
    const totals = computeCashTotals(1000, [
      {
        id: 'p1',
        amountTotal: 250,
        sign: -1,
        isVoid: false,
        trxCode: { code: '9000' },
      },
    ]);
    expect(totals.cashIn).toBe(250);
    expect(totals.cashOut).toBe(0);
    expect(totals.expectedCash).toBe(1250);
  });

  it('should ignore non-9000 charges', () => {
    const totals = computeCashTotals(1000, [
      {
        id: 'c1',
        amountTotal: 500,
        sign: 1,
        isVoid: false,
        trxCode: { code: '1000' },
      },
    ]);
    expect(totals.expectedCash).toBe(1000);
  });

  it('should still count voided originals by sign', () => {
    const totals = computeCashTotals(1000, [
      {
        id: 'orig',
        amountTotal: 200,
        sign: -1,
        isVoid: true,
        trxCode: { code: '9000' },
      },
      {
        id: 'corr',
        amountTotal: 200,
        sign: 1,
        isVoid: false,
        trxCode: { code: '9000' },
      },
    ]);
    expect(totals.expectedCash).toBe(1000);
  });
});
