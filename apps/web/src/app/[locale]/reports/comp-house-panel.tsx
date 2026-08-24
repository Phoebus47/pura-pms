'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reservationsAPI, type Reservation } from '@/lib/api/reservations';
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
    return <p className="text-slate-600 text-sm">{t('reports.loading')}</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="text-slate-600 text-sm">{t('reports.compHouseEmpty')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <dl className="gap-4 grid sm:grid-cols-3">
        <div>
          <dt className="text-slate-600 text-sm">
            {t('reports.compHouseTotalComp')}
          </dt>
          <dd className="font-semibold text-slate-800">{totalComp}</dd>
        </div>
        <div>
          <dt className="text-slate-600 text-sm">
            {t('reports.compHouseTotalHouse')}
          </dt>
          <dd className="font-semibold text-slate-800">{totalHouse}</dd>
        </div>
        <div>
          <dt className="text-slate-600 text-sm">
            {t('reports.compHouseRevenueLost')}
          </dt>
          <dd className="font-semibold text-slate-800">
            ฿{lost.toLocaleString()}
          </dd>
        </div>
      </dl>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-600">
              <th className="pr-4 py-2">{t('reports.compHouseRoom')}</th>
              <th className="pr-4 py-2">{t('reports.compHouseGuest')}</th>
              <th className="pr-4 py-2">{t('reports.compHouseNights')}</th>
              <th className="pr-4 py-2">{t('reports.compHouseAuthority')}</th>
              <th className="pr-4 py-2">{t('reports.compHousePurpose')}</th>
              <th className="py-2">{t('reports.compHouseDepartment')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((reservation) => (
              <tr key={reservation.id} className="border-b border-slate-100">
                <td className="pr-4 py-2">
                  <div className="flex flex-wrap gap-1 items-center">
                    <span>{reservation.room?.number}</span>
                    <StayPurposeBadge
                      stayPurpose={reservation.stayPurpose}
                      size="xs"
                    />
                  </div>
                </td>
                <td className="pr-4 py-2">
                  {reservation.guest
                    ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
                    : '—'}
                </td>
                <td className="pr-4 py-2">{billedNights(reservation)}</td>
                <td className="pr-4 py-2">{reservation.approvedBy || '—'}</td>
                <td className="pr-4 py-2">
                  {reservation.stayPurposeNote || '—'}
                </td>
                <td className="py-2">{reservation.department || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
