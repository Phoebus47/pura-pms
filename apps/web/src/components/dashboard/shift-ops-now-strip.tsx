import { CalendarDays, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
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
      className="border border-rule-mist motion-enter p-(--panel-pad) shadow-panel surface-desk"
    >
      <PageHeader
        eyebrow={t('shiftOps.title')}
        title={propertyName || t('shiftOps.propertyFallback')}
        subtitle={formatMessage('shiftOps.businessDate', {
          date: businessDate,
        })}
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <div>
                <dt className="text-ink-subtle">{t('shiftOps.occupancy')}</dt>
                <dd className="font-semibold tabular-nums text-pura-blue">
                  {formatMessage('shiftOps.occupancyValue', {
                    rate: occupancyRate,
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-ink-subtle">{t('shiftOps.readyToSell')}</dt>
                <dd className="font-semibold tabular-nums text-pura-blue">
                  {formatMessage('shiftOps.readyToSellValue', {
                    ready: readyToSell,
                    total: totalRooms,
                  })}
                </dd>
              </div>
            </dl>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="sm:w-auto w-full">
                <Link href="/reservations/new">
                  <Plus className="h-4 mr-2 w-4" aria-hidden />
                  {t('shiftOps.newReservation')}
                </Link>
              </Button>
              <Button asChild variant="outline" className="sm:w-auto w-full">
                <Link href="/reservations/calendar">
                  <CalendarDays className="h-4 mr-2 w-4" aria-hidden />
                  {t('shiftOps.openCalendar')}
                </Link>
              </Button>
            </div>
          </div>
        }
      />
    </section>
  );
}
