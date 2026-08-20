import { BadRequestException } from '@nestjs/common';

export const GC_MISSING_PROPERTY = 'propertyId is required';
export const GC_NOT_OPEN_STATUS = 'Only open complaints can be started';
export const GC_NOT_RESOLVABLE_STATUS =
  'Only open or in-progress complaints can be resolved';
export const GC_NOT_RESOLVED_STATUS = 'Only resolved complaints can be closed';

export function assertCanStart(status: string): void {
  if (status !== 'OPEN') {
    throw new BadRequestException(GC_NOT_OPEN_STATUS);
  }
}

export function assertCanResolve(status: string): void {
  if (status !== 'OPEN' && status !== 'IN_PROGRESS') {
    throw new BadRequestException(GC_NOT_RESOLVABLE_STATUS);
  }
}

export function assertCanClose(status: string): void {
  if (status !== 'RESOLVED') {
    throw new BadRequestException(GC_NOT_RESOLVED_STATUS);
  }
}
