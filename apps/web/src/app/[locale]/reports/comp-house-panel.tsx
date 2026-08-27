'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reservationsAPI, type Reservation } from '@/lib/api/reservations';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { StatTile } from '@/components/shared/stat-tile';
import { StayPurposeBadge } from '@/components/stay-purpose-badge';
import { t } from '@/lib/i18n';

interface CompHousePanelProps {
  readonly propertyId?: string;
  readonly date: string;
}

function toDay(value: string | undefined): string {
  return (value ?? '').slice(0, 10);
}

function overlapsBusinessDate(reservation: Reservation, date: string): boolean {
  const day = toDay(date);
  const checkIn = toDay(reservation.checkIn);
  const checkOut = toDay(reservation.checkOut);
  if (!day || !checkIn) {
    return false;
  }
  if (reservation.isDayUse) {
    return checkIn === day;
  }
  return checkIn <= day && day < checkOut;
}

function billedNights(reservation: Reservation): number {
  if (reservation.isDayUse) {
    return 1;
  }
  return reservation.nights || 0;
}

function revenueLost(reservation: Reservation): number {
  return (
    Number(reservation.room?.roomType.baseRate || 0) * billedNights(reservation)
  );
}

function compHouseColumns(): DataTableColumn<Reservation>[] {
  return [
    {
      id: 'room',
      header: t('reports.compHouseRoom'),
      cell: (reservation) => (
        <div className="flex flex-wrap gap-1 items-center">
          <span>{reservation.room?.number}</span>
          <StayPurposeBadge stayPurpose={reservation.stayPurpose} size="xs" />
        </div>
      ),
    },
    {
      id: 'guest',
      header: t('reports.compHouseGuest'),
      cell: (reservation) =>
        reservation.guest
          ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
          : '—',
    },
    {
      id: 'nights',
      header: t('reports.compHouseNights'),
      numeric: true,
      cell: (reservation) => billedNights(reservation),
    },
    {
      id: 'authority',
      header: t('reports.compHouseAuthority'),
      cell: (reservation) => reservation.approvedBy || '—',
    },
    {
      id: 'purpose',
      header: t('reports.compHousePurpose'),
      cell: (reservation) => reservation.stayPurposeNote || '—',
    },
    {
      id: 'department',
      header: t('reports.compHouseDepartment'),
      hideOnMobile: true,
      cell: (reservation) => reservation.department || '—',
    },
  ];
}

export function CompHousePanel({ propertyId, date }: CompHousePanelProps) {
  const { data: complimentary = [], isLoading: loadingComp } = useQuery({
    queryKey: ['reservations', 'comp', propertyId],
    queryFn: () =>
      reservationsAPI.getAll({
        propertyId,
        stayPurpose: 'COMPLIMENTARY',
      }),
    enabled: Boolean(propertyId),
  });
  const { data: houseUse = [], isLoading: loadingHouse } = useQuery({
    queryKey: ['reservations', 'house', propertyId],
    queryFn: () =>
      reservationsAPI.getAll({
        propertyId,
        stayPurpose: 'HOUSE_USE',
      }),
    enabled: Boolean(propertyId),
  });

  const rows = useMemo(() => {
    return [...complimentary, ...houseUse].filter((reservation) =>
      overlapsBusinessDate(reservation, date),
    );
  }, [complimentary, houseUse, date]);

  const loading = loadingComp || loadingHouse;
  const totalComp = rows.filter(
    (row) => row.stayPurpose === 'COMPLIMENTARY',
  ).length;
  const totalHouse = rows.filter(
    (row) => row.stayPurpose === 'HOUSE_USE',
  ).length;
  const lost = rows.reduce((sum, row) => sum + revenueLost(row), 0);

  if (loading) {
    return <p className="text-ink-subtle text-sm">{t('reports.loading')}</p>;
  }

  if (rows.length === 0) {
    return <EmptyState title={t('reports.compHouseEmpty')} />;
  }

  return (
    <div className="space-y-4">
      <div className="gap-4 grid sm:grid-cols-3">
        <StatTile label={t('reports.compHouseTotalComp')} value={totalComp} />
        <StatTile label={t('reports.compHouseTotalHouse')} value={totalHouse} />
        <StatTile
          label={t('reports.compHouseRevenueLost')}
          value={`฿${lost.toLocaleString()}`}
          tone="critical"
        />
      </div>
      <DataTable
        caption={t('reports.compHouseTitle')}
        columns={compHouseColumns()}
        rows={rows}
        rowKey={(reservation) => reservation.id}
        density="compact"
        stickyHeader
      />
    </div>
  );
}
