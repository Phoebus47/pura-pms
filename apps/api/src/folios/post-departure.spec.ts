import { ConflictException } from '@nestjs/common';
import { FolioStatus } from '@pura/database';
import {
  assertFolioOpenForPosting,
  assertFolioReopenable,
} from './post-departure';

describe('assertFolioOpenForPosting', () => {
  it('does not throw when the folio is open', () => {
    expect(() => assertFolioOpenForPosting(FolioStatus.OPEN)).not.toThrow();
  });

  it.each([
    FolioStatus.CLOSED,
    FolioStatus.POSTED_TO_CITY_LEDGER,
    FolioStatus.TRANSFERRED,
    null,
  ])('throws ConflictException when status is %s', (status) => {
    expect(() => assertFolioOpenForPosting(status)).toThrow(ConflictException);
  });
});

describe('assertFolioReopenable', () => {
  it('does not throw when the folio is closed', () => {
    expect(() => assertFolioReopenable(FolioStatus.CLOSED)).not.toThrow();
  });

  it.each([
    FolioStatus.OPEN,
    FolioStatus.POSTED_TO_CITY_LEDGER,
    FolioStatus.TRANSFERRED,
    null,
  ])('throws ConflictException when status is %s', (status) => {
    expect(() => assertFolioReopenable(status)).toThrow(ConflictException);
  });
});
