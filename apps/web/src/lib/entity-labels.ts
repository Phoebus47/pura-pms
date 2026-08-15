import type { FolioListItem } from '@/lib/api/folios';
import type { ArAccount } from '@/lib/api/ar-accounts';
import type { Reservation } from '@/lib/api/reservations';

function guestName(
  guest?: { firstName?: string; lastName?: string } | null,
): string {
  if (!guest) return '';
  return `${guest.firstName ?? ''} ${guest.lastName ?? ''}`.trim();
}

export function folioOptionLabel(folio: FolioListItem): string {
  const room = folio.reservation?.room?.number;
  return [folio.folioNumber, guestName(folio.reservation?.guest), room]
    .filter(Boolean)
    .join(' · ');
}

export function reservationOptionLabel(reservation: Reservation): string {
  const room = reservation.room?.number;
  return [reservation.confirmNumber, guestName(reservation.guest), room]
    .filter(Boolean)
    .join(' · ');
}

export function arAccountOptionLabel(account: ArAccount): string {
  return `${account.accountNumber} · ${account.companyName}`;
}
