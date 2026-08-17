export type StayPurpose = 'STANDARD' | 'COMPLIMENTARY' | 'HOUSE_USE';

export function isNonRevenueStay(
  purpose: StayPurpose | null | undefined,
): boolean {
  return purpose === 'COMPLIMENTARY' || purpose === 'HOUSE_USE';
}
