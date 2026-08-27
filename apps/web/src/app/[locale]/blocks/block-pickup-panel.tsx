'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatTile } from '@/components/shared/stat-tile';
import {
  useAttachBlockReservation,
  useBlockPickup,
  useReleaseBlock,
} from '@/hooks/use-blocks';

const buttonClass = 'w-full sm:w-auto';

export function PickupPanel({ blockId }: { readonly blockId: string }) {
  const { data: report } = useBlockPickup(blockId);
  const attachMutation = useAttachBlockReservation();
  const releaseMutation = useReleaseBlock();
  const [reservationId, setReservationId] = useState('');

  async function attach() {
    try {
      await attachMutation.mutateAsync({ id: blockId, reservationId });
      toast.success(t('blocks.attachSuccess'));
      setReservationId('');
    } catch {
      toast.error(t('blocks.attachFailed'));
    }
  }

  async function release() {
    try {
      await releaseMutation.mutateAsync(blockId);
      toast.success(t('blocks.releaseSuccess'));
    } catch {
      toast.error(t('blocks.releaseFailed'));
    }
  }

  const remaining = report?.remaining ?? 0;

  return (
    <div className="space-y-4">
      <div className="gap-4 grid grid-cols-2">
        <StatTile label={t('blocks.pickedUp')} value={report?.pickedUp ?? 0} />
        <StatTile
          label={t('blocks.remaining')}
          value={remaining}
          tone={remaining === 0 ? 'caution' : 'positive'}
        />
      </div>
      {report?.nights?.length ? (
        <ul className="space-y-1 tabular-nums text-ink-default text-sm">
          {report.nights.map((night) => (
            <li key={night.stayDate}>
              {night.stayDate}: {night.pickedUp}/{night.allotted} (
              {t('blocks.remaining')} {night.remaining})
            </li>
          ))}
        </ul>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="blockReservationId">{t('blocks.reservationId')}</Label>
        <Input
          id="blockReservationId"
          name="reservationId"
          value={reservationId}
          onChange={(event) => setReservationId(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className={buttonClass}
          onClick={() => void attach()}
        >
          {t('blocks.attach')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={buttonClass}
          onClick={() => void release()}
        >
          {t('blocks.release')}
        </Button>
      </div>
    </div>
  );
}
