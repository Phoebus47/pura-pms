import { BadRequestException } from '@nestjs/common';
import { ReservationStatus, TaxExemptReason } from '@pura/database';
import {
  assertCanChangeTaxExempt,
  assertTaxExemptFields,
} from './tax-exemption';

describe('tax-exemption', () => {
  it('allows non-exempt reservations without extra fields', () => {
    expect(() => assertTaxExemptFields({ taxExempt: false })).not.toThrow();
  });

  it('requires reason, document, and approver when exempt', () => {
    expect(() =>
      assertTaxExemptFields({
        taxExempt: true,
        taxExemptReason: TaxExemptReason.DIPLOMATIC,
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts a complete tax-exempt payload', () => {
    expect(() =>
      assertTaxExemptFields({
        taxExempt: true,
        taxExemptReason: TaxExemptReason.GOVERNMENT,
        taxExemptDocumentRef: 'TM.30-1',
        taxExemptApprovedBy: 'GM',
      }),
    ).not.toThrow();
  });

  it('blocks changing exemption after checkout', () => {
    expect(() =>
      assertCanChangeTaxExempt(ReservationStatus.CHECKED_OUT, false, true),
    ).toThrow(BadRequestException);
  });

  it('allows changing exemption before check-out', () => {
    expect(() =>
      assertCanChangeTaxExempt(ReservationStatus.CHECKED_IN, false, true),
    ).not.toThrow();
  });
});
