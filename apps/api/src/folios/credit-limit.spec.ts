import {
  isOverCreditLimit,
  remainingArCredit,
  resolveCreditLimit,
  wouldExceedArCredit,
} from './credit-limit';

describe('credit-limit', () => {
  it('should prefer the folio limit over the property default', () => {
    expect(resolveCreditLimit(500, 1000)).toBe(500);
  });

  it('should inherit the property default when the folio limit is null', () => {
    expect(resolveCreditLimit(null, 1000)).toBe(1000);
  });

  it('should treat missing limits as unlimited', () => {
    expect(resolveCreditLimit(null, null)).toBeNull();
    expect(isOverCreditLimit(9999, null)).toBe(false);
  });

  it('should flag a balance above the limit', () => {
    expect(isOverCreditLimit(1000.01, 1000)).toBe(true);
    expect(isOverCreditLimit(1000, 1000)).toBe(false);
  });

  it('should block charges that would exceed remaining AR credit', () => {
    expect(remainingArCredit(5000, 4800)).toBe(200);
    expect(wouldExceedArCredit(201, 200)).toBe(true);
    expect(wouldExceedArCredit(200, 200)).toBe(false);
  });
});
