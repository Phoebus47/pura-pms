import type { PortalReservationSummary } from '@/lib/api/portal';
import { t } from '@/lib/i18n';

export function formatStayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function guestDisplayName(
  reservation: PortalReservationSummary,
): string {
  if (!reservation.guest) return '';
  return `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim();
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    TENTATIVE: t('portal.statusTentative'),
    CONFIRMED: t('portal.statusConfirmed'),
    CHECKED_IN: t('portal.statusCheckedIn'),
    CHECKED_OUT: t('portal.statusCheckedOut'),
    CANCELLED: t('portal.statusCancelled'),
    NO_SHOW: t('portal.statusNoShow'),
    WALKED: t('portal.statusWalked'),
  };
  return labels[status] ?? status;
}
