'use client';

import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import type { LostFoundItem } from '@/lib/api/lost-found';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import {
  isLostFoundOverdue,
  lostFoundStatusLabel,
  lostFoundStatusTone,
} from './lost-found-helpers';

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
    <li className="border border-rule-mist p-4 rounded-lg space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <p className="font-semibold text-ink-strong">{item.itemDescription}</p>
        <StatusBadge
          tone={lostFoundStatusTone(item.status)}
          label={lostFoundStatusLabel(item.status)}
          size="sm"
        />
        {isLostFoundOverdue(item) ? (
          <StatusBadge
            tone="critical"
            label={t('lostFound.overdue')}
            size="sm"
          />
        ) : null}
      </div>
      <p className="text-ink-subtle text-sm">
        {item.locationFound}
        {item.roomNumber ? ` · ${t('lostFound.room')} ${item.roomNumber}` : ''}
      </p>
      {item.status === 'FOUND' ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
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
