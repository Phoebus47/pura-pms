import { BadRequestException } from '@nestjs/common';

export const RATE_DERIVE_MODES = ['PERCENT_OFFSET', 'AMOUNT_OFFSET'] as const;
export type RateDeriveMode = (typeof RATE_DERIVE_MODES)[number];

export const RATE_DERIVE_FIELDS_MESSAGE =
  'Derived rates require a parent, derive mode, and derive value';
export const RATE_DERIVE_NEGATIVE_MESSAGE =
  'Derived rate amount cannot be negative';
export const RATE_DERIVE_CYCLE_MESSAGE =
  'A rate cannot be derived from itself or from one of its children';
export const RATE_DERIVE_AMOUNT_LOCKED_MESSAGE =
  'Amount of a derived rate is calculated from its parent';

export interface RateDerivationInput {
  parentRateId?: string | null;
  deriveMode?: RateDeriveMode | null;
  deriveValue?: number | null;
}

export function isRateDeriveMode(value: string): value is RateDeriveMode {
  return (RATE_DERIVE_MODES as readonly string[]).includes(value);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function derivedAmount(
  parentAmount: number,
  mode: RateDeriveMode,
  value: number,
): number {
  const next =
    mode === 'PERCENT_OFFSET'
      ? parentAmount * (1 + value / 100)
      : parentAmount + value;
  const rounded = roundMoney(next);
  if (rounded < 0) {
    throw new BadRequestException(RATE_DERIVE_NEGATIVE_MESSAGE);
  }
  return rounded;
}

export function assertDerivationFields(input: RateDerivationInput): void {
  const hasParent = Boolean(input.parentRateId);
  const hasMode = Boolean(input.deriveMode);
  const hasValue =
    input.deriveValue !== undefined && input.deriveValue !== null;
  if (!hasParent && !hasMode && !hasValue) {
    return;
  }
  if (hasParent && hasMode && hasValue) {
    return;
  }
  throw new BadRequestException(RATE_DERIVE_FIELDS_MESSAGE);
}

export function createsDerivationCycle(
  rateId: string | undefined,
  ancestorIds: string[],
): boolean {
  if (!rateId) {
    return false;
  }
  return ancestorIds.includes(rateId);
}

export function describeDerivation(
  parentCode: string,
  mode: RateDeriveMode,
  value: number,
): string {
  const signed = value >= 0 ? `+${value}` : `${value}`;
  if (mode === 'PERCENT_OFFSET') {
    return `${parentCode} ${signed}%`;
  }
  return `${parentCode} ${signed}`;
}
