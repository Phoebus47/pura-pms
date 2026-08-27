'use client';

import { type Reservation } from '@/lib/api';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { ReservationStatusBadge } from '@/components/reservation-status-badge';
import { DayUseBadge } from '@/components/day-use-badge';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { BillingCycleBadge } from '@/components/billing-cycle-badge';
import { TaxExemptBadge } from '@/components/tax-exempt-badge';
import { RoomLockBadge } from '@/components/room-lock-badge';
import { SplitStayBadge } from '@/components/split-stay-badge';
import { isSplitStay } from '@/lib/split-stay';
import { t } from '@/lib/i18n';
import { formatStayDate } from './format-stay-date';

interface ReservationTableProps {
  readonly reservations: Reservation[];
  readonly onSelect: (reservation: Reservation) => void;
}

function ReservationStatusCell({
  reservation,
}: {
  readonly reservation: Reservation;
}) {
  return (
    <span className="flex flex-nowrap gap-1 items-center">
      <ReservationStatusBadge status={reservation.status} />
      {reservation.isDayUse ? <DayUseBadge /> : null}
      <StayPurposeBadge stayPurpose={reservation.stayPurpose} />
      <BillingCycleBadge billingCycle={reservation.billingCycle} />
      <TaxExemptBadge taxExempt={reservation.taxExempt} />
      <RoomLockBadge isRoomLocked={reservation.isRoomLocked} />
      {isSplitStay(reservation) ? <SplitStayBadge /> : null}
    </span>
  );
}

export function ReservationTable({
  reservations,
  onSelect,
}: ReservationTableProps) {
  const columns: DataTableColumn<Reservation>[] = [
    {
      id: 'confirmation',
      header: t('reservations.list.table.confirmation'),
      cell: (reservation) => (
        <span className="font-mono text-pura-blue whitespace-nowrap">
          {reservation.confirmNumber}
        </span>
      ),
    },
    {
      id: 'guest',
      header: t('reservations.list.table.guest'),
      cell: (reservation) => (
        <>
          <span className="block font-semibold text-ink-strong whitespace-nowrap">
            {reservation.guest?.firstName} {reservation.guest?.lastName}
          </span>
          <span className="block max-w-48 text-ink-subtle text-xs truncate">
            {reservation.guest?.email}
          </span>
        </>
      ),
    },
    {
      id: 'room',
      header: t('reservations.list.table.room'),
      cell: (reservation) => (
        <>
          <span className="block font-semibold text-ink-strong whitespace-nowrap">
            {t('reservations.list.roomPrefix')} {reservation.room?.number}
          </span>
          <span className="block max-w-40 text-ink-subtle text-xs truncate">
            {reservation.room?.roomType.name}
          </span>
        </>
      ),
    },
    {
      id: 'checkIn',
      header: t('reservations.list.table.checkIn'),
      cell: (reservation) => (
        <span className="whitespace-nowrap">
          {formatStayDate(reservation.checkIn)}
        </span>
      ),
    },
    {
      id: 'checkOut',
      header: t('reservations.list.table.checkOut'),
      cell: (reservation) => (
        <span className="whitespace-nowrap">
          {formatStayDate(reservation.checkOut)}
        </span>
      ),
    },
    {
      id: 'nights',
      header: t('reservations.list.table.nights'),
      numeric: true,
      cell: (reservation) => reservation.nights,
    },
    {
      id: 'total',
      header: t('reservations.list.table.total'),
      numeric: true,
      cell: (reservation) => (
        <span className="font-semibold text-pura-blue">
          ฿{Number(reservation.totalAmount).toLocaleString()}
        </span>
      ),
    },
    {
      id: 'status',
      header: t('reservations.list.table.status'),
      cell: (reservation) => (
        <ReservationStatusCell reservation={reservation} />
      ),
    },
  ];

  return (
    <DataTable
      caption={t('reservations.list.tableCaption')}
      columns={columns}
      rows={reservations}
      rowKey={(reservation) => reservation.id}
      stickyHeader
      onRowClick={onSelect}
    />
  );
}
