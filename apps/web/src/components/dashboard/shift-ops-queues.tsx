import { Link } from '@/i18n/navigation';
import { formatMessage, t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { QueueMetric } from '@/lib/dashboard/shift-ops';

interface QueueCardProps {
  readonly title: string;
  readonly metric: QueueMetric;
  readonly href: string;
  readonly tone?: 'default' | 'signal';
}

function QueueCard({ title, metric, href, tone = 'default' }: QueueCardProps) {
  const done = Math.max(metric.total - metric.remaining, 0);
  return (
    <Link
      href={href}
      className={cn(
        'surface-desk motion-enter motion-enter-delay-1 block border border-border/80 p-4 transition-colors duration-200 hover:border-pura-blue/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        tone === 'signal' && metric.remaining > 0 && 'border-pura-orange/40',
      )}
    >
      <p className="font-medium text-muted-foreground text-sm">{title}</p>
      <p className="font-bold mt-2 tabular-nums text-3xl text-pura-blue tracking-tight">
        {metric.remaining}
        <span className="font-semibold text-lg text-muted-foreground">
          {' '}
          / {metric.total}
        </span>
      </p>
      <p className="mt-1 text-muted-foreground text-xs">
        {formatMessage('shiftOps.remainingHint', {
          remaining: metric.remaining,
          done,
        })}
      </p>
    </Link>
  );
}

interface ShiftOpsQueuesProps {
  readonly arrivals: QueueMetric;
  readonly departures: QueueMetric;
  readonly unassigned: QueueMetric;
}

export function ShiftOpsQueues({
  arrivals,
  departures,
  unassigned,
}: ShiftOpsQueuesProps) {
  return (
    <section aria-label={t('shiftOps.queuesLabel')} className="space-y-3">
      <h2 className="font-semibold text-pura-blue/80 text-sm tracking-wide uppercase">
        {t('shiftOps.queuesTitle')}
      </h2>
      <div className="gap-3 grid grid-cols-1 md:grid-cols-3">
        <QueueCard
          title={t('shiftOps.arrivals')}
          metric={arrivals}
          href="/reservations?status=CONFIRMED"
          tone="signal"
        />
        <QueueCard
          title={t('shiftOps.departures')}
          metric={departures}
          href="/reservations?status=CHECKED_IN"
        />
        <QueueCard
          title={t('shiftOps.unassigned')}
          metric={unassigned}
          href="/reservations?status=CONFIRMED"
          tone="signal"
        />
      </div>
    </section>
  );
}
