import { BadRequestException } from '@nestjs/common';
import {
  CASH_PAYMENT_CODE,
  MISSING_FOREIGN_AMOUNT_MESSAGE,
  convertForeignToBase,
  formatFxReference,
  needsCashFxConversion,
  requireForeignAmount,
} from './cash-fx';

describe('cash-fx', () => {
  it('converts only cash 9000 in a foreign currency', () => {
    expect(needsCashFxConversion(CASH_PAYMENT_CODE, 'USD', 'THB')).toBe(true);
    expect(needsCashFxConversion(CASH_PAYMENT_CODE, 'THB', 'THB')).toBe(false);
    expect(needsCashFxConversion(CASH_PAYMENT_CODE, undefined, 'THB')).toBe(
      false,
    );
    expect(needsCashFxConversion('1000', 'USD', 'THB')).toBe(false);
  });

  it('formats the posting reference with 4 decimal rate places', () => {
    expect(formatFxReference('usd', 100, 35)).toBe('FX USD 100 @ 35.0000');
  });

  it('rounds converted amount to 2 decimal places', () => {
    expect(convertForeignToBase(100, 35)).toBe(3500);
    expect(convertForeignToBase(10.55, 35.1234)).toBe(370.55);
  });

  it('requires foreignAmount when converting', () => {
    expect(() => requireForeignAmount(undefined)).toThrow(BadRequestException);
    expect(() => requireForeignAmount(undefined)).toThrow(
      MISSING_FOREIGN_AMOUNT_MESSAGE,
    );
    expect(requireForeignAmount(100)).toBe(100);
  });
});
