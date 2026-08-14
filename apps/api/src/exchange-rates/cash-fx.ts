import { BadRequestException } from '@nestjs/common';
import { round2 } from '../folios/folio-posting';

export const CASH_PAYMENT_CODE = '9000';
export const MISSING_FX_RATE_MESSAGE =
  'No exchange rate found for this currency and business date';
export const MISSING_FOREIGN_AMOUNT_MESSAGE =
  'foreignAmount is required when posting cash in a foreign currency';

/**
 * Guest currency is targetCurrency; property currency is baseCurrency.
 * Rate = how many base units per 1 target (e.g. USD→THB 35 means 1 USD = 35 THB).
 */
export function needsCashFxConversion(
  trxCode: string | undefined,
  currency: string | undefined,
  propertyCurrency: string,
): currency is string {
  if (trxCode !== CASH_PAYMENT_CODE || !currency) {
    return false;
  }
  return currency.toUpperCase() !== propertyCurrency.toUpperCase();
}

export function formatFxReference(
  currency: string,
  foreignAmount: number,
  rate: number,
): string {
  return `FX ${currency.toUpperCase()} ${foreignAmount} @ ${rate.toFixed(4)}`;
}

export function convertForeignToBase(
  foreignAmount: number,
  rate: number,
): number {
  return round2(foreignAmount * rate);
}

export function requireForeignAmount(
  foreignAmount: number | undefined,
): number {
  if (foreignAmount === undefined) {
    throw new BadRequestException(MISSING_FOREIGN_AMOUNT_MESSAGE);
  }
  return foreignAmount;
}
