import type { Prisma } from '@pura/database';

/**
 * Guest currency is targetCurrency; property currency is baseCurrency.
 * Rate = how many base units per 1 target (e.g. USD→THB 35 means 1 USD = 35 THB).
 */
export function postingRateQuery(
  baseCurrency: string,
  targetCurrency: string,
  businessDate: Date,
): {
  where: Prisma.ExchangeRateWhereInput;
  orderBy: Prisma.ExchangeRateOrderByWithRelationInput;
} {
  return {
    where: {
      baseCurrency: baseCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase(),
      isActive: true,
      effectiveDate: { lte: businessDate },
    },
    orderBy: { effectiveDate: 'desc' },
  };
}
