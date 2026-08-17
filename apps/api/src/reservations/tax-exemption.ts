import { BadRequestException } from '@nestjs/common';
import { ReservationStatus, TaxExemptReason } from '@pura/database';

export interface TaxExemptFields {
  taxExempt?: boolean | null;
  taxExemptReason?: TaxExemptReason | null;
  taxExemptDocumentRef?: string | null;
  taxExemptApprovedBy?: string | null;
}

const TERMINAL_STATUSES: ReservationStatus[] = [
  ReservationStatus.CHECKED_OUT,
  ReservationStatus.CANCELLED,
  ReservationStatus.NO_SHOW,
  ReservationStatus.WALKED,
];

export function assertTaxExemptFields(input: TaxExemptFields): void {
  if (!input.taxExempt) {
    return;
  }
  if (
    !input.taxExemptReason ||
    !input.taxExemptDocumentRef?.trim() ||
    !input.taxExemptApprovedBy?.trim()
  ) {
    throw new BadRequestException(
      'Tax exemption requires a reason, document reference, and approver',
    );
  }
}

export function assertCanChangeTaxExempt(
  currentStatus: ReservationStatus,
  currentExempt: boolean,
  nextExempt: boolean | undefined,
): void {
  if (nextExempt === undefined || nextExempt === currentExempt) {
    return;
  }
  if (TERMINAL_STATUSES.includes(currentStatus)) {
    throw new BadRequestException(
      'Tax exemption cannot be changed after checkout, cancel, no-show, or walk',
    );
  }
}
