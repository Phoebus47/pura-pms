import { Link } from '@/i18n/navigation';
import { formatMessage, t } from '@/lib/i18n';

interface ExceptionItem {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly href: string;
}

interface ShiftOpsExceptionsProps {
  readonly vipCount: number;
  readonly dirtyRooms: number;
  readonly balanceDueCount: number;
}

export function ShiftOpsExceptions({
  vipCount,
  dirtyRooms,
  balanceDueCount,
}: ShiftOpsExceptionsProps) {
  const items: ExceptionItem[] = [
    {
      id: 'dirty',
      label: t('shiftOps.exceptionDirty'),
      count: dirtyRooms,
      href: '/housekeeping',
    },
    {
      id: 'vip',
      label: t('shiftOps.exceptionVip'),
      count: vipCount,
      href: '/reservations',
    },
    {
      id: 'balance',
      label: t('shiftOps.exceptionBalance'),
      count: balanceDueCount,
      href: '/billing',
    },
  ].filter((item) => item.count > 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={t('shiftOps.exceptionsLabel')}
      className="border border-pura-orange/30 motion-enter motion-enter-delay-2 p-4 surface-desk"
    >
      <h2 className="font-semibold text-pura-orange-dark text-sm">
        {t('shiftOps.exceptionsTitle')}
      </h2>
      <ul className="flex flex-wrap gap-2 mt-3">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="bg-pura-orange/10 border border-pura-orange/25 duration-200 font-medium gap-2 hover:bg-pura-orange/20 inline-flex items-center min-h-11 px-3 rounded-md text-pura-blue text-sm transition-colors"
            >
              <span>{item.label}</span>
              <span className="font-bold tabular-nums text-pura-orange-dark">
                {formatMessage('shiftOps.exceptionCount', {
                  count: item.count,
                })}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
