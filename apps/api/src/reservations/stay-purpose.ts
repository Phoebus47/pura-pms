import { BadRequestException } from '@nestjs/common';
import { ReservationStatus, StayPurpose } from '@pura/database';

export const COMP_RATE_CODE = 'COMP';
export const HOUSE_RATE_CODE = 'HOUSE';

export interface StayPurposeFields {
  stayPurpose?: StayPurpose;
  approvedBy?: string | null;
  department?: string | null;
}

export function isNonRevenueStay(
  purpose: StayPurpose | null | undefined,
): boolean {
  return (
    purpose === StayPurpose.COMPLIMENTARY || purpose === StayPurpose.HOUSE_USE
  );
}

export function defaultRateCodeForPurpose(
  purpose: StayPurpose,
  existing?: string | null,
): string | undefined {
  if (existing) {
    return existing;
  }
  if (purpose === StayPurpose.COMPLIMENTARY) {
    return COMP_RATE_CODE;
  }
  if (purpose === StayPurpose.HOUSE_USE) {
    return HOUSE_RATE_CODE;
  }
  return undefined;
}

export function assertStayPurposeFields(input: StayPurposeFields): void {
  const purpose = input.stayPurpose ?? StayPurpose.STANDARD;
  if (!isNonRevenueStay(purpose)) {
    return;
  }
  if (!input.approvedBy?.trim()) {
    throw new BadRequestException(
      'Authority is required for complimentary and house-use stays',
    );
  }
  if (purpose === StayPurpose.HOUSE_USE && !input.department?.trim()) {
    throw new BadRequestException('Department is required for house-use stays');
  }
}

export function assertCanChangeStayPurpose(
  currentStatus: ReservationStatus,
  currentPurpose: StayPurpose,
  nextPurpose: StayPurpose | undefined,
): void {
  if (nextPurpose === undefined || nextPurpose === currentPurpose) {
    return;
  }
  if (
    currentStatus !== ReservationStatus.TENTATIVE &&
    currentStatus !== ReservationStatus.CONFIRMED
  ) {
    throw new BadRequestException(
      'Stay purpose can only be changed before check-in',
    );
  }
}

export function zeroNonRevenueAmount(
  purpose: StayPurpose,
  amount: number,
): number {
  return isNonRevenueStay(purpose) ? 0 : amount;
}
