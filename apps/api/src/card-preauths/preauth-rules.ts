import { CardPreauthStatus } from '@pura/database';

export const CARD_PAYMENT_TRX_CODE = '9001';
export const CARD_CODE_MISSING =
  'Card payment transaction code 9001 is not configured';
export const PREAUTH_NOT_HOLDABLE = 'Pre-authorization cannot be incremented';
export const PREAUTH_NOT_CAPTURABLE = 'Pre-authorization cannot be captured';
export const PREAUTH_NOT_RELEASABLE = 'Pre-authorization cannot be released';
export const INCREMENT_TOO_SMALL =
  'Incremental amount must be greater than the current hold';
export const CAPTURE_EXCEEDS_HOLD =
  'Capture amount cannot exceed the held amount';

export function isOpenHold(status: CardPreauthStatus): boolean {
  return (
    status === CardPreauthStatus.HELD ||
    status === CardPreauthStatus.INCREMENTAL
  );
}
