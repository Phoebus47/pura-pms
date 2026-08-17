import { ConflictException } from '@nestjs/common';
import { FolioStatus } from '@pura/database';

export const FOLIO_NOT_OPEN_FOR_POSTING =
  'Folio is not open for posting. Reopen a closed folio first.';
export const FOLIO_NOT_REOPENABLE =
  'Only a closed folio can be reopened for a post-departure charge';

/**
 * A folio must be OPEN to accept a new transaction. This is what makes
 * `reopen()` meaningful: without this guard a cashier could already post
 * into a CLOSED (or AR-transferred) folio, defeating the "closed folio is
 * immutable" invariant financial audit relies on.
 */
export function assertFolioOpenForPosting(status: FolioStatus | null): void {
  if (status !== FolioStatus.OPEN) {
    throw new ConflictException(FOLIO_NOT_OPEN_FOR_POSTING);
  }
}

/**
 * Only a folio closed via the normal checkout flow can be reopened. A folio
 * already transferred to city ledger has an open invoice; reopening it would
 * desync the invoice amount, so that path is out of scope for this slice.
 */
export function assertFolioReopenable(status: FolioStatus | null): void {
  if (status !== FolioStatus.CLOSED) {
    throw new ConflictException(FOLIO_NOT_REOPENABLE);
  }
}
