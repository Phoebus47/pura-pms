export const GUEST_LEDGER_CODE = '1100';
export const JOURNAL_SOURCE_MANUAL = 'MANUAL';
export const JOURNAL_SOURCE_NIGHT_AUDIT = 'NIGHT_AUDIT';

export interface JournalTrxInput {
  type: string;
  sign: number;
  amountTotal: unknown;
  glAccountCode: string;
}

export interface DraftJournalLine {
  glAccountCode: string;
  debit: number;
  credit: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isChargeLike(trx: JournalTrxInput): boolean {
  if (trx.type === 'PAYMENT') {
    return false;
  }
  if (trx.type === 'CHARGE') {
    return true;
  }
  return trx.sign === 1;
}

export function draftLinesForTransaction(
  trx: JournalTrxInput,
): DraftJournalLine[] {
  const amount = round2(Math.abs(Number(trx.amountTotal)));
  if (amount === 0 || !trx.glAccountCode) {
    return [];
  }
  if (isChargeLike(trx)) {
    return [
      { glAccountCode: GUEST_LEDGER_CODE, debit: amount, credit: 0 },
      { glAccountCode: trx.glAccountCode, debit: 0, credit: amount },
    ];
  }
  return [
    { glAccountCode: trx.glAccountCode, debit: amount, credit: 0 },
    { glAccountCode: GUEST_LEDGER_CODE, debit: 0, credit: amount },
  ];
}

export function mergeDraftLines(
  lines: readonly DraftJournalLine[],
): DraftJournalLine[] {
  const byCode = new Map<string, DraftJournalLine>();
  for (const line of lines) {
    const current = byCode.get(line.glAccountCode) ?? {
      glAccountCode: line.glAccountCode,
      debit: 0,
      credit: 0,
    };
    current.debit = round2(current.debit + line.debit);
    current.credit = round2(current.credit + line.credit);
    byCode.set(line.glAccountCode, current);
  }
  return [...byCode.values()].filter(
    (line) => line.debit !== 0 || line.credit !== 0,
  );
}

export function isBalanced(lines: readonly DraftJournalLine[]): boolean {
  const debit = round2(lines.reduce((sum, line) => sum + line.debit, 0));
  const credit = round2(lines.reduce((sum, line) => sum + line.credit, 0));
  return debit === credit;
}

export function journalEntryNumber(
  propertyId: string,
  businessDate: Date | string,
  source: string,
): string {
  const ymd =
    typeof businessDate === 'string'
      ? businessDate.slice(0, 10).replaceAll('-', '')
      : businessDate.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = propertyId.slice(-6);
  return `JE-${ymd}-${source}-${suffix}`;
}
