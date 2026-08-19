import { BadRequestException } from '@nestjs/common';
import {
  assertDraftStatus,
  assertSignedStatus,
  assertValidSignatureData,
  nextVersion,
} from './reg-card-rules';

const validSignature = 'data:image/png;base64,' + 'A'.repeat(120);

describe('reg-card-rules', () => {
  it('accepts valid PNG data URL', () => {
    expect(() => assertValidSignatureData(validSignature)).not.toThrow();
  });

  it('rejects non-PNG prefix', () => {
    expect(() =>
      assertValidSignatureData('data:image/jpeg;base64,abc'),
    ).toThrow(BadRequestException);
  });

  it('rejects short payload', () => {
    expect(() =>
      assertValidSignatureData('data:image/png;base64,short'),
    ).toThrow(BadRequestException);
  });

  it('asserts draft status', () => {
    expect(() => assertDraftStatus('DRAFT')).not.toThrow();
    expect(() => assertDraftStatus('SIGNED')).toThrow(BadRequestException);
  });

  it('asserts signed status', () => {
    expect(() => assertSignedStatus('SIGNED')).not.toThrow();
    expect(() => assertSignedStatus('DRAFT')).toThrow(BadRequestException);
  });

  it('computes next version', () => {
    expect(nextVersion(null)).toBe(1);
    expect(nextVersion(2)).toBe(3);
  });
});
