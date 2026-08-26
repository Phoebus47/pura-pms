import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMessage, t } from '@/lib/i18n';
import { Link } from '@/i18n/navigation';

interface ShiftOpsNowStripProps {
  readonly businessDate: string;
  readonly propertyName: string;
  readonly occupancyRate: number;
  readonly readyToSell: number;
  readonly totalRooms: number;
}

export function ShiftOpsNowStrip({
  businessDate,
  propertyName,
  occupancyRate,
  readyToSell,
  totalRooms,
}: ShiftOpsNowStripProps) {
  return (
    <section
      aria-label={t('shiftOps.nowStripLabel')}
      className="border border-border/80 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between motion-enter p-4 sm:p-5 surface-desk"
    >
      <div className="min-w-0 space-y-1">
        <p className="font-semibold text-pura-blue/70 text-xs tracking-wide uppercase">
          {t('shiftOps.title')}
        </p>
        <h1 className="font-bold sm:text-3xl text-2xl text-pura-blue tracking-tight">
          {propertyName || t('shiftOps.propertyFallback')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {formatMessage('shiftOps.businessDate', { date: businessDate })}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">{t('shiftOps.occupancy')}</dt>
            <dd className="font-semibold tabular-nums text-pura-blue">
              {formatMessage('shiftOps.occupancyValue', {
                rate: occupancyRate,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {t('shiftOps.readyToSell')}
            </dt>
            <dd className="font-semibold tabular-nums text-pura-blue">
              {formatMessage('shiftOps.readyToSellValue', {
                ready: readyToSell,
                total: totalRooms,
              })}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="min-h-11 sm:w-auto w-full">
            <Link href="/reservations/new">
              <Plus className="h-4 mr-2 w-4" aria-hidden />
              {t('shiftOps.newReservation')}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="min-h-11 sm:w-auto w-full"
          >
            <Link href="/reservations/calendar">
              <CalendarDays className="h-4 mr-2 w-4" aria-hidden />
              {t('shiftOps.openCalendar')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
