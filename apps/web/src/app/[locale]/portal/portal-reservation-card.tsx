'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PortalReservationSummary } from '@/lib/api/portal';
import { t } from '@/lib/i18n';
import { formatStayDate, guestDisplayName, statusLabel } from './portal-format';

interface PortalReservationCardProps {
  readonly reservation: PortalReservationSummary;
  readonly onReset: () => void;
}

export function PortalReservationCard({
  reservation,
  onReset,
}: PortalReservationCardProps) {
  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-2xl">
          {t('portal.reservationDetails')}
        </CardTitle>
        <Button type="button" variant="outline" onClick={onReset}>
          {t('portal.startOver')}
        </Button>
      </CardHeader>
      <CardContent>
        <dl className="gap-3 grid sm:grid-cols-2 text-lg">
          <div>
            <dt className="text-slate-500 text-sm">{t('portal.guest')}</dt>
            <dd className="font-medium">{guestDisplayName(reservation)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-sm">{t('portal.room')}</dt>
            <dd className="font-medium">
              {reservation.room?.number ?? t('portal.unassignedRoom')}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 text-sm">
              {t('portal.checkInDate')}
            </dt>
            <dd className="font-medium">
              {formatStayDate(reservation.checkIn)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 text-sm">
              {t('portal.checkOutDate')}
            </dt>
            <dd className="font-medium">
              {formatStayDate(reservation.checkOut)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500 text-sm">{t('portal.status')}</dt>
            <dd className="font-medium">{statusLabel(reservation.status)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
