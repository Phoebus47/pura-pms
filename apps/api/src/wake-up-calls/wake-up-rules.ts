import { BadRequestException } from '@nestjs/common';

const SCHEDULABLE = new Set(['CONFIRMED', 'CHECKED_IN']);

export function assertSchedulableReservation(status: string): void {
  if (!SCHEDULABLE.has(status)) {
    throw new BadRequestException(
      'Wake-up calls can only be scheduled for confirmed or checked-in reservations',
    );
  }
}

export function assertScheduledStatus(status: string): void {
  if (status !== 'SCHEDULED') {
    throw new BadRequestException(
      'Only scheduled wake-up calls can be updated',
    );
  }
}

export function toScheduledDate(scheduledAt: Date): Date {
  return new Date(
    Date.UTC(
      scheduledAt.getUTCFullYear(),
      scheduledAt.getUTCMonth(),
      scheduledAt.getUTCDate(),
    ),
  );
}
