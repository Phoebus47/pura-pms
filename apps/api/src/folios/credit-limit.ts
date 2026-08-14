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

/**
 * P3-PR11 auto-settlement: block further charges when a linked company
 * AR account would exceed remaining credit. Do not auto-transfer to city
 * ledger and do not auto-charge cards.
 */
export const AR_CREDIT_EXCEEDED_MESSAGE =
  'Folio balance exceeds the company AR credit limit';
export const AR_ACCOUNT_INACTIVE_MESSAGE = 'AR account is inactive';

export function remainingArCredit(
  creditLimit: unknown,
  currentBalance: unknown,
): number {
  return Math.round((Number(creditLimit) - Number(currentBalance)) * 100) / 100;
}

export function wouldExceedArCredit(
  projectedFolioBalance: number,
  remaining: number,
): boolean {
  return projectedFolioBalance > remaining;
}
