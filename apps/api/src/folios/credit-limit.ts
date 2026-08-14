export function resolveCreditLimit(
  folioLimit: unknown,
  propertyDefault: unknown,
): number | null {
  if (folioLimit !== null && folioLimit !== undefined && folioLimit !== '') {
    return Number(folioLimit);
  }
  if (
    propertyDefault !== null &&
    propertyDefault !== undefined &&
    propertyDefault !== ''
  ) {
    return Number(propertyDefault);
  }
  return null;
}

export function isOverCreditLimit(
  balance: number,
  limit: number | null,
): boolean {
  if (limit === null || Number.isNaN(limit)) {
    return false;
  }
  return balance > limit;
}
