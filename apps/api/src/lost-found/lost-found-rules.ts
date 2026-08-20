import { BadRequestException } from '@nestjs/common';

export const LF_MISSING_PROPERTY = 'propertyId is required';
export const LF_NOT_FOUND_STATUS =
  'Only found items can be claimed or disposed';
export const LF_NOT_CLAIMED_STATUS = 'Only claimed items can be returned';
export const DEFAULT_RETENTION_DAYS = 90;

export function assertCanClaim(status: string): void {
  if (status !== 'FOUND') {
    throw new BadRequestException(LF_NOT_FOUND_STATUS);
  }
}

export function assertCanReturn(status: string): void {
  if (status !== 'CLAIMED') {
    throw new BadRequestException(LF_NOT_CLAIMED_STATUS);
  }
}

export function assertCanDispose(status: string): void {
  if (status !== 'FOUND') {
    throw new BadRequestException(LF_NOT_FOUND_STATUS);
  }
}

export function retentionEndsAt(foundAt: Date, retentionDays: number): Date {
  return new Date(foundAt.getTime() + retentionDays * 24 * 60 * 60 * 1000);
}

export function isRetentionOverdue(
  status: string,
  foundAt: Date,
  retentionDays: number,
  now: Date = new Date(),
): boolean {
  return (
    status === 'FOUND' &&
    retentionEndsAt(foundAt, retentionDays).getTime() < now.getTime()
  );
}
