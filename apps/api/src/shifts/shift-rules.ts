import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ShiftStatus } from '@pura/database';
import { round2 } from './shift-cash';

export const SUPER_ADMIN_PERMISSION = 'ALL';
export const SHIFT_APPROVE_PERMISSION = 'SHIFT_APPROVE';

export function assertShiftIsOpen(status: ShiftStatus): void {
  if (status !== ShiftStatus.OPEN) {
    throw new BadRequestException('Shift is not open');
  }
}

export function requireVarianceReason(
  variance: number,
  varianceReason?: string,
): void {
  if (variance !== 0 && !varianceReason) {
    throw new BadRequestException(
      'varianceReason is required when cash variance is not zero',
    );
  }
}

export function closeStatusForVariance(
  variance: number,
): typeof ShiftStatus.BALANCED | typeof ShiftStatus.CLOSED {
  return variance === 0 ? ShiftStatus.BALANCED : ShiftStatus.CLOSED;
}

export function assertCanApprove(status: ShiftStatus): void {
  if (status === ShiftStatus.OPEN) {
    throw new BadRequestException('Cannot approve an open shift');
  }
  if (status === ShiftStatus.BALANCED) {
    throw new BadRequestException('Shift is already balanced');
  }
}

export function hasShiftApprovePermission(
  permissions: readonly string[],
): boolean {
  return (
    permissions.includes(SUPER_ADMIN_PERMISSION) ||
    permissions.includes(SHIFT_APPROVE_PERMISSION)
  );
}

export function assertApproverAllowed(
  approverUserId: string,
  shiftUserId: string,
  permissions: readonly string[],
): void {
  if (!hasShiftApprovePermission(permissions)) {
    throw new ForbiddenException(
      'Missing SHIFT_APPROVE permission to approve this shift',
    );
  }
  const isSelf = approverUserId === shiftUserId;
  const isSuperAdmin = permissions.includes(SUPER_ADMIN_PERMISSION);
  if (isSelf && !isSuperAdmin) {
    throw new ForbiddenException('Cannot self-approve a shift');
  }
}

export function closePayload(
  closingCash: number,
  expectedCash: number,
  userId: string,
  extras: {
    varianceReason?: string;
    notes?: string;
    handoverToUserId?: string;
  },
) {
  const cashVariance = round2(closingCash - expectedCash);
  requireVarianceReason(cashVariance, extras.varianceReason);
  return {
    closingCash,
    expectedCash,
    cashVariance,
    status: closeStatusForVariance(cashVariance),
    endTime: new Date(),
    closedBy: userId,
    varianceReason: extras.varianceReason,
    notes: extras.notes,
    handoverToUserId: extras.handoverToUserId,
  };
}
