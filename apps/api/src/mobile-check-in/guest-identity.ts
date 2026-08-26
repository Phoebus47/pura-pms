import { BadRequestException } from '@nestjs/common';

const IDENTITY_MISMATCH_MESSAGE = 'Last name does not match this reservation';

export function assertLastNameMatches(
  guestLastName: string,
  providedLastName?: string,
): void {
  const trimmedInput = providedLastName?.trim();
  if (!trimmedInput) {
    return;
  }

  if (guestLastName.trim().toLowerCase() !== trimmedInput.toLowerCase()) {
    throw new BadRequestException(IDENTITY_MISMATCH_MESSAGE);
  }
}
