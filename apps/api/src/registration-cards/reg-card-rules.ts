import { BadRequestException } from '@nestjs/common';

const PNG_PREFIX = 'data:image/png;base64,';
const MIN_SIGNATURE_LENGTH = 100;

export function assertValidSignatureData(signatureData: string): void {
  if (!signatureData.startsWith(PNG_PREFIX)) {
    throw new BadRequestException(
      'Signature must be a PNG data URL (data:image/png;base64,...)',
    );
  }
  const payload = signatureData.slice(PNG_PREFIX.length).trim();
  if (payload.length < MIN_SIGNATURE_LENGTH) {
    throw new BadRequestException('Signature data is too short');
  }
}

export function assertDraftStatus(status: string): void {
  if (status !== 'DRAFT') {
    throw new BadRequestException(
      'Only draft registration cards can be signed',
    );
  }
}

export function assertSignedStatus(status: string): void {
  if (status !== 'SIGNED') {
    throw new BadRequestException(
      'Only signed registration cards can be voided',
    );
  }
}

export function nextVersion(latestVersion: number | null): number {
  return (latestVersion ?? 0) + 1;
}
