export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export interface SnapshotLine {
  isVoid: boolean;
  sign: number;
  amountNet: unknown;
  amountTax: unknown;
  amountTotal: unknown;
}

export interface FolioChargeSnapshot {
  amountNet: number;
  amountTax: number;
  amountTotal: number;
}

export function snapshotFolioCharges(
  lines: readonly SnapshotLine[],
): FolioChargeSnapshot {
  let amountNet = 0;
  let amountTax = 0;
  let amountTotal = 0;
  for (const line of lines) {
    if (line.isVoid || line.sign !== 1) {
      continue;
    }
    amountNet += Number(line.amountNet);
    amountTax += Number(line.amountTax);
    amountTotal += Number(line.amountTotal);
  }
  return {
    amountNet: round2(amountNet),
    amountTax: round2(amountTax),
    amountTotal: round2(amountTotal),
  };
}
