export const WINDOW_DESCRIPTIONS = [
  'Main Billing',
  'Auxiliary window 2',
  'Auxiliary window 3',
  'Auxiliary window 4',
] as const;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function standardWindowCreates() {
  return [1, 2, 3, 4].map((n) => ({
    windowNumber: n,
    description: WINDOW_DESCRIPTIONS[n - 1],
  }));
}

export interface PostingTrxCode {
  type: string;
  hasService: boolean;
  serviceRate: unknown;
  hasTax: boolean;
}

export function computePostingAmounts(
  amountNetInput: number,
  trxCode: PostingTrxCode,
) {
  const amountNet = round2(Number(amountNetInput));
  let amountService = 0;
  let amountTax = 0;

  if (trxCode.hasService && trxCode.serviceRate) {
    amountService = round2((amountNet * Number(trxCode.serviceRate)) / 100);
  }

  if (trxCode.hasTax) {
    amountTax = round2((amountNet + amountService) * 0.07);
  }

  const amountTotal = round2(amountNet + amountService + amountTax);
  const sign =
    trxCode.type === 'PAYMENT' ||
    trxCode.type === 'DEPOSIT' ||
    trxCode.type === 'REFUND'
      ? -1
      : 1;

  return { amountNet, amountService, amountTax, amountTotal, sign };
}
