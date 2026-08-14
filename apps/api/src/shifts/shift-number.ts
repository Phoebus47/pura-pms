const PROPERTY_ID_SUFFIX_LENGTH = 6;

export function toYmd(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function datesEqualYmd(
  left: Date | string,
  right: Date | string,
): boolean {
  return toYmd(left) === toYmd(right);
}

export function shiftNumberPrefix(
  businessDate: Date | string,
  propertyId: string,
): string {
  const ymd = toYmd(businessDate).replaceAll('-', '');
  const suffix = propertyId.slice(-PROPERTY_ID_SUFFIX_LENGTH);
  return `SH-${ymd}-${suffix}-`;
}

export async function nextShiftNumber(
  countMatching: (prefix: string) => Promise<number>,
  businessDate: Date | string,
  propertyId: string,
): Promise<string> {
  const prefix = shiftNumberPrefix(businessDate, propertyId);
  const count = await countMatching(prefix);
  return `${prefix}${count + 1}`;
}
