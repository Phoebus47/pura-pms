export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface TrialBalanceReport {
  businessDate: string;
  propertyId: string;
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function summarizeTrialBalance(
  lines: readonly {
    debit: unknown;
    credit: unknown;
    account: { code: string; name: string };
  }[],
): { rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number } {
  const byCode = new Map<string, TrialBalanceRow>();
  for (const line of lines) {
    const current = byCode.get(line.account.code) ?? {
      accountCode: line.account.code,
      accountName: line.account.name,
      debit: 0,
      credit: 0,
    };
    current.debit = round2(current.debit + Number(line.debit));
    current.credit = round2(current.credit + Number(line.credit));
    byCode.set(line.account.code, current);
  }
  const rows = [...byCode.values()].sort((a, b) =>
    a.accountCode.localeCompare(b.accountCode),
  );
  return {
    rows,
    totalDebit: round2(rows.reduce((sum, row) => sum + row.debit, 0)),
    totalCredit: round2(rows.reduce((sum, row) => sum + row.credit, 0)),
  };
}
