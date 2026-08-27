'use client';

import { Button } from '@/components/ui/button';
import type { LostFoundItem } from '@/lib/api/lost-found';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { isLostFoundOverdue, lostFoundStatusLabel } from './lost-found-helpers';

interface LostFoundItemCardProps {
  item: LostFoundItem;
  userId: string;
  onClaim: (id: string, claimedBy: string) => Promise<unknown>;
  onReturn: (id: string, returnedTo: string) => Promise<unknown>;
  onDispose: (
    id: string,
    disposedBy: string,
    disposeReason: string,
  ) => Promise<unknown>;
}

export function LostFoundItemCard({
  item,
  userId,
  onClaim,
  onReturn,
  onDispose,
}: LostFoundItemCardProps) {
  const returnedTo = item.guest
    ? `${item.guest.firstName} ${item.guest.lastName}`
    : t('lostFound.deskClaimant');

  return (
    <li className="border border-rule-mist p-3 rounded-md">
      <p className="font-semibold text-foreground">
        {item.itemDescription}
        {isLostFoundOverdue(item) ? ` · ${t('lostFound.overdue')}` : ''}
      </p>
      <p className="text-muted-foreground text-sm">
        {item.locationFound}
        {item.roomNumber ? ` · ${t('lostFound.room')} ${item.roomNumber}` : ''}
        {' · '}
        {lostFoundStatusLabel(item.status)}
      </p>
      {item.status === 'FOUND' ? (
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            type="button"
            className="min-h-11"
            onClick={() =>
              void onClaim(item.id, userId)
                .then(() => toast.success(t('lostFound.claimSuccess')))
                .catch(() => toast.error(t('lostFound.actionFailed')))
            }
          >
            {t('lostFound.claim')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() =>
              void onDispose(
                item.id,
                userId,
                t('lostFound.defaultDisposeReason'),
              )
                .then(() => toast.success(t('lostFound.disposeSuccess')))
                .catch(() => toast.error(t('lostFound.actionFailed')))
            }
          >
            {t('lostFound.dispose')}
          </Button>
        </div>
      ) : null}
      {item.status === 'CLAIMED' ? (
        <Button
          type="button"
          className="min-h-11 mt-2"
          onClick={() =>
            void onReturn(item.id, returnedTo)
              .then(() => toast.success(t('lostFound.returnSuccess')))
              .catch(() => toast.error(t('lostFound.actionFailed')))
          }
        >
          {t('lostFound.return')}
        </Button>
      ) : null}
    </li>
  );
}
