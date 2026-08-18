import { BadRequestException } from '@nestjs/common';
import {
  RATE_DERIVE_CYCLE_MESSAGE,
  RATE_DERIVE_FIELDS_MESSAGE,
  RATE_DERIVE_NEGATIVE_MESSAGE,
  assertDerivationFields,
  createsDerivationCycle,
  derivedAmount,
  describeDerivation,
  isRateDeriveMode,
  roundMoney,
} from './rate-derive';

describe('rate-derive', () => {
  describe('derivedAmount', () => {
    it('applies a percent off the parent amount', () => {
      expect(derivedAmount(1500, 'PERCENT_OFFSET', -10)).toBe(1350);
    });

    it('applies a percent markup on the parent amount', () => {
      expect(derivedAmount(2000, 'PERCENT_OFFSET', 15)).toBe(2300);
    });

    it('applies a fixed amount offset', () => {
      expect(derivedAmount(3500, 'AMOUNT_OFFSET', -200)).toBe(3300);
    });

    it('rounds to two decimal places', () => {
      expect(roundMoney(10.005)).toBe(10.01);
      expect(derivedAmount(100, 'PERCENT_OFFSET', -33.3)).toBe(66.7);
    });

    it('rejects a negative derived amount', () => {
      expect(() => derivedAmount(100, 'AMOUNT_OFFSET', -150)).toThrow(
        BadRequestException,
      );
      expect(() => derivedAmount(100, 'AMOUNT_OFFSET', -150)).toThrow(
        RATE_DERIVE_NEGATIVE_MESSAGE,
      );
    });
  });

  describe('assertDerivationFields', () => {
    it('allows a standalone rate with no derivation fields', () => {
      expect(() => assertDerivationFields({})).not.toThrow();
    });

    it('allows a complete derived rate', () => {
      expect(() =>
        assertDerivationFields({
          parentRateId: 'rate-1',
          deriveMode: 'PERCENT_OFFSET',
          deriveValue: -10,
        }),
      ).not.toThrow();
    });

    it('rejects a parent without a formula', () => {
      expect(() => assertDerivationFields({ parentRateId: 'rate-1' })).toThrow(
        RATE_DERIVE_FIELDS_MESSAGE,
      );
    });
  });

  describe('createsDerivationCycle', () => {
    it('detects a self parent', () => {
      expect(createsDerivationCycle('rate-1', ['rate-1'])).toBe(true);
    });

    it('detects an ancestor loop', () => {
      expect(createsDerivationCycle('child', ['parent', 'child'])).toBe(true);
    });

    it('allows a new child of an unrelated parent', () => {
      expect(createsDerivationCycle('child', ['parent', 'grand'])).toBe(false);
    });

    it('skips cycle check for unsaved rates', () => {
      expect(createsDerivationCycle(undefined, ['parent'])).toBe(false);
    });
  });

  it('describes percent and amount formulas', () => {
    expect(describeDerivation('BAR', 'PERCENT_OFFSET', -10)).toBe('BAR -10%');
    expect(describeDerivation('BAR', 'AMOUNT_OFFSET', 200)).toBe('BAR +200');
  });

  it('recognizes derive modes', () => {
    expect(isRateDeriveMode('PERCENT_OFFSET')).toBe(true);
    expect(isRateDeriveMode('NOPE')).toBe(false);
  });

  it('exports the cycle message constant', () => {
    expect(RATE_DERIVE_CYCLE_MESSAGE).toContain('itself');
  });
});
