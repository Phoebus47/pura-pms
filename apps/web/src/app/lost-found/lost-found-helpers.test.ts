import { isLostFoundOverdue, lostFoundStatusLabel } from './lost-found-helpers';
import type { LostFoundItem } from '@/lib/api/lost-found';
import { t } from '@/lib/i18n';

function item(overrides: Partial<LostFoundItem>): LostFoundItem {
  return {
    id: 'lf-1',
    propertyId: 'prop-1',
    itemDescription: 'Wallet',
    locationFound: 'Lobby',
    roomNumber: null,
    foundBy: 'usr-1',
    foundAt: new Date().toISOString(),
    notes: null,
    guestId: null,
    status: 'FOUND',
    claimedAt: null,
    claimedBy: null,
    returnedAt: null,
    returnedTo: null,
    disposedAt: null,
    disposedBy: null,
    disposeReason: null,
    retentionDays: 90,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    guest: null,
    ...overrides,
  };
}

describe('lost-found-helpers', () => {
  it('maps status labels', () => {
    expect(lostFoundStatusLabel('FOUND')).toBe(t('lostFound.statusFound'));
    expect(lostFoundStatusLabel('CLAIMED')).toBe(t('lostFound.statusClaimed'));
    expect(lostFoundStatusLabel('RETURNED')).toBe(
      t('lostFound.statusReturned'),
    );
    expect(lostFoundStatusLabel('DISPOSED')).toBe(
      t('lostFound.statusDisposed'),
    );
  });

  it('flags found items past retention', () => {
    expect(
      isLostFoundOverdue(
        item({ foundAt: '2020-01-01T00:00:00.000Z', status: 'FOUND' }),
      ),
    ).toBe(true);
    expect(
      isLostFoundOverdue(
        item({ foundAt: '2020-01-01T00:00:00.000Z', status: 'CLAIMED' }),
      ),
    ).toBe(false);
  });
});
