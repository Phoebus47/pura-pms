import { InvoiceStatus } from '@pura/database';
import { round2 } from '../folios/folio-posting';
import { toUtcDateOnly } from './aging';

export const CITY_LEDGER_TRX_CODE = '9005';
export const CITY_LEDGER_CODE_MISSING =
  'City ledger transaction code 9005 is not configured';
export const FOLIO_NO_BALANCE = 'Folio has no balance to transfer';
export const FOLIO_NOT_TRANSFERABLE =
  'Folio cannot be transferred to city ledger';
export const FOLIO_ALREADY_INVOICED =
  'An active city ledger invoice already exists for this folio';
export const ACCOUNT_INACTIVE = 'AR account is inactive';
export const PROPERTY_MISMATCH = 'Folio property does not match the AR account';
export const PAYMENT_EXCEEDS_BALANCE =
  'Payment exceeds the invoice outstanding balance';
export const INVOICE_NOT_PAYABLE = 'Invoice cannot accept a payment';

export function addDaysUtc(date: Date | string, days: number): Date {
  const base = toUtcDateOnly(date);
  base.setUTCDate(base.getUTCDate() + days);
  return base;
}

export function statusAfterPayment(
  amount: number,
  paidAmount: number,
): InvoiceStatus {
  if (paidAmount <= 0) {
    return InvoiceStatus.OPEN;
  }
  if (round2(amount - paidAmount) <= 0) {
    return InvoiceStatus.PAID;
  }
  return InvoiceStatus.PARTIAL;
}
