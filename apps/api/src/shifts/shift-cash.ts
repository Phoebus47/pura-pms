export const CASH_TRX_CODE = '9000';

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface CashTrxLine {
  id: string;
  amountTotal: unknown;
  sign: number;
  isVoid: boolean;
  trxCode?: { code: string } | null;
}

export interface CashTotals {
  cashIn: number;
  cashOut: number;
  expectedCash: number;
}

export function computeCashTotals(
  openingCash: number,
  lines: readonly CashTrxLine[],
): CashTotals {
  let cashIn = 0;
  let cashOut = 0;
  for (const line of lines) {
    if (line.trxCode?.code !== CASH_TRX_CODE) {
      continue;
    }
    const amount = Number(line.amountTotal);
    if (line.sign === -1) {
      cashIn += amount;
    } else if (line.sign === 1) {
      cashOut += amount;
    }
  }
  return {
    cashIn: round2(cashIn),
    cashOut: round2(cashOut),
    expectedCash: round2(openingCash + cashIn - cashOut),
  };
}

export function moneyNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value);
}

export interface ShiftMoneyFields {
  openingCash: unknown;
  closingCash: unknown;
  expectedCash: unknown;
  cashVariance: unknown;
}

export function serializeShiftMoney<T extends ShiftMoneyFields>(shift: T) {
  return {
    ...shift,
    openingCash: Number(shift.openingCash),
    closingCash: moneyNumber(shift.closingCash),
    expectedCash: moneyNumber(shift.expectedCash),
    cashVariance: moneyNumber(shift.cashVariance),
  };
}

export function cashSummaryFromLines(
  openingCash: number,
  lines: readonly CashTrxLine[],
  expectedCashOverride?: number | null,
) {
  const totals = computeCashTotals(openingCash, lines);
  const expectedCash =
    expectedCashOverride === null || expectedCashOverride === undefined
      ? totals.expectedCash
      : expectedCashOverride;
  return {
    cashIn: totals.cashIn,
    cashOut: totals.cashOut,
    expectedCash,
    transactionCount: lines.length,
    cashLines: lines
      .filter((line) => line.trxCode?.code === CASH_TRX_CODE)
      .map((line) => ({
        id: line.id,
        amountTotal: Number(line.amountTotal),
        sign: line.sign,
        isVoid: line.isVoid,
        code: CASH_TRX_CODE,
      })),
  };
}
