export type TaxExemptReason =
  | 'DIPLOMATIC'
  | 'GOVERNMENT'
  | 'INTERNATIONAL_ORG'
  | 'OTHER';

export const TAX_EXEMPT_REASONS: readonly TaxExemptReason[] = [
  'DIPLOMATIC',
  'GOVERNMENT',
  'INTERNATIONAL_ORG',
  'OTHER',
];
