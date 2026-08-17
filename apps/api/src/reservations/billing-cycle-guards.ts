import { BadRequestException } from '@nestjs/common';
import { BillingCycle } from '@pura/database';
import { isExtendedBillingCycle } from './billing-cycle';

export function assertBillingCycleCompatible(
  billingCycle: BillingCycle,
  isDayUse: boolean,
  splitStayCount: number,
): void {
  if (!isExtendedBillingCycle(billingCycle)) {
    return;
  }
  if (isDayUse) {
    throw new BadRequestException(
      'Weekly and monthly billing cannot be used for day-use reservations',
    );
  }
  if (splitStayCount > 0) {
    throw new BadRequestException(
      'Weekly and monthly billing cannot be used with split stays',
    );
  }
}
