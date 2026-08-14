import {
  draftLinesForTransaction,
  isBalanced,
  journalEntryNumber,
  mergeDraftLines,
} from './journal-lines';

describe('journal-lines', () => {
  it('should debit guest ledger and credit revenue for a charge', () => {
    expect(
      draftLinesForTransaction({
        type: 'CHARGE',
        sign: 1,
        amountTotal: 1070,
        glAccountCode: '4000-01',
      }),
    ).toEqual([
      { glAccountCode: '1100', debit: 1070, credit: 0 },
      { glAccountCode: '4000-01', debit: 0, credit: 1070 },
    ]);
  });

  it('should debit cash and credit guest ledger for a payment', () => {
    expect(
      draftLinesForTransaction({
        type: 'PAYMENT',
        sign: -1,
        amountTotal: 500,
        glAccountCode: '1000-01',
      }),
    ).toEqual([
      { glAccountCode: '1000-01', debit: 500, credit: 0 },
      { glAccountCode: '1100', debit: 0, credit: 500 },
    ]);
  });

  it('should merge lines by account and stay balanced', () => {
    const merged = mergeDraftLines([
      ...draftLinesForTransaction({
        type: 'CHARGE',
        sign: 1,
        amountTotal: 100,
        glAccountCode: '4000-01',
      }),
      ...draftLinesForTransaction({
        type: 'CHARGE',
        sign: 1,
        amountTotal: 50,
        glAccountCode: '4000-01',
      }),
    ]);
    expect(merged).toEqual([
      { glAccountCode: '1100', debit: 150, credit: 0 },
      { glAccountCode: '4000-01', debit: 0, credit: 150 },
    ]);
    expect(isBalanced(merged)).toBe(true);
  });

  it('should build a stable entry number', () => {
    expect(journalEntryNumber('abcprop01', '2026-08-14', 'MANUAL')).toBe(
      'JE-20260814-MANUAL-prop01',
    );
  });
});
