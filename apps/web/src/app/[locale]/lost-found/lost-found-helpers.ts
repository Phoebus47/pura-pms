import type { LostFoundItem } from '@/lib/api/lost-found';
import { t } from '@/lib/i18n';

export function lostFoundStatusLabel(status: LostFoundItem['status']): string {
  if (status === 'FOUND') return t('lostFound.statusFound');
  if (status === 'CLAIMED') return t('lostFound.statusClaimed');
  if (status === 'RETURNED') return t('lostFound.statusReturned');
  return t('lostFound.statusDisposed');
}

export function isLostFoundOverdue(row: LostFoundItem): boolean {
  if (row.status !== 'FOUND') return false;
  const end =
    new Date(row.foundAt).getTime() + row.retentionDays * 24 * 60 * 60 * 1000;
  return end < Date.now();
}
