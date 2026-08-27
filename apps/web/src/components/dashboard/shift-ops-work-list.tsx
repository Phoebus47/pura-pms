import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { t } from '@/lib/i18n';
import type { ShiftOpsWorkItem } from '@/lib/dashboard/shift-ops';
import { cn } from '@/lib/utils';

interface ShiftOpsWorkListProps {
  readonly items: ShiftOpsWorkItem[];
}

function kindLabel(kind: ShiftOpsWorkItem['kind']): string {
  switch (kind) {
    case 'arrival':
      return t('shiftOps.kindArrival');
    case 'departure':
      return t('shiftOps.kindDeparture');
    default:
      return t('shiftOps.kindUnassigned');
  }
}

function actionLabel(kind: ShiftOpsWorkItem['kind']): string {
  switch (kind) {
    case 'arrival':
      return t('shiftOps.actionCheckIn');
    case 'departure':
      return t('shiftOps.actionCheckOut');
    default:
      return t('shiftOps.actionOpen');
  }
}

function blockerLabel(code: string): string {
  switch (code) {
    case 'unassigned':
      return t('shiftOps.blockerUnassigned');
    case 'vip':
      return t('shiftOps.blockerVip');
    case 'dirty':
      return t('shiftOps.blockerDirty');
    case 'balanceDue':
      return t('shiftOps.blockerBalance');
    default:
      return code;
  }
}

export function ShiftOpsWorkList({ items }: ShiftOpsWorkListProps) {
  return (
    <section
      aria-label={t('shiftOps.workListLabel')}
      className="border border-border/80 motion-enter motion-enter-delay-3 surface-desk"
    >
      <div className="border-b border-border/80 flex items-center justify-between px-4 py-3 sm:px-5">
        <h2 className="font-semibold text-base text-pura-blue">
          {t('shiftOps.workListTitle')}
        </h2>
        <Link
          href="/reservations"
          className="font-medium hover:underline text-pura-blue text-sm underline-offset-4"
        >
          {t('shiftOps.viewAll')}
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-10 sm:px-5 text-center text-muted-foreground text-sm">
          {t('shiftOps.workListEmpty')}
        </p>
      ) : (
        <ul className="divide-border/80 divide-y">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex flex-col gap-3 px-4 py-3 transition-colors duration-200 hover:bg-pura-blue/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-5',
              )}
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="font-semibold text-foreground truncate">
                    {item.guestName}
                  </p>
                  <span className="bg-pura-blue/10 font-medium px-2 py-0.5 rounded text-pura-blue text-xs">
                    {kindLabel(item.kind)}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm truncate">
                  {t('common.roomLabel')} {item.roomLabel} ·{' '}
                  {item.confirmNumber}
                </p>
                {item.blockers.length > 0 ? (
                  <ul className="flex flex-wrap gap-1.5 pt-1">
                    {item.blockers.map((code) => (
                      <li
                        key={code}
                        className="bg-pura-orange/10 border border-pura-orange/30 font-medium px-2 py-0.5 rounded text-pura-orange-dark text-xs"
                      >
                        {blockerLabel(code)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Button
                asChild
                size="sm"
                className="min-h-11 shrink-0 sm:min-w-28"
              >
                <Link href={item.href}>{actionLabel(item.kind)}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
