export function toYmd(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function invoiceYearPrefix(businessDate: Date | string): string {
  return `TI-${toYmd(businessDate).slice(0, 4)}-`;
}

export function formatInvoiceNumber(year: string, seq: number): string {
  return `TI-${year}-${String(seq).padStart(6, '0')}`;
}

export async function nextInvoiceNumber(
  countMatching: (prefix: string) => Promise<number>,
  businessDate: Date | string,
): Promise<string> {
  const year = toYmd(businessDate).slice(0, 4);
  const prefix = invoiceYearPrefix(businessDate);
  const count = await countMatching(prefix);
  return formatInvoiceNumber(year, count + 1);
}
