import type { Shift, ShiftStatus } from '@/lib/api/shifts';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  type DataTableColumn,
} from '@/components/shared/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { StatusBadge } from '@/components/shared/status-badge';
import { statusToneInk, type StatusTone } from '@/lib/design/status-tone';

const STATUS_TONE: Record<ShiftStatus, StatusTone> = {
  OPEN: 'info',
  CLOSED: 'caution',
  BALANCED: 'positive',
};

export function statusLabel(status: ShiftStatus): string {
  if (status === 'OPEN') return t('shifts.openStatus');
  if (status === 'CLOSED') return t('shifts.closed');
  return t('shifts.balanced');
}

export function formatMoney(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString();
}

/** A non-zero drawer variance is the thing a manager must act on. */
function varianceTone(variance: number | null | undefined): StatusTone {
  return Number(variance ?? 0) === 0 ? 'positive' : 'critical';
}

interface CurrentShiftCardProps {
  readonly shift: Shift | null | undefined;
}

export function CurrentShiftCard({ shift }: CurrentShiftCardProps) {
  if (!shift) {
    return (
      <Panel title={t('shifts.current')}>
        <p className="text-ink-subtle text-sm">{t('shifts.noShiftHint')}</p>
      </Panel>
    );
  }

  return (
    <Panel
      title={t('shifts.current')}
      actions={
        <StatusBadge
          tone={STATUS_TONE[shift.status]}
          label={statusLabel(shift.status)}
        />
      }
    >
      <div className="space-y-4">
        <div className="gap-4 grid sm:grid-cols-3">
          <StatTile
            label={t('shifts.openingCash')}
            value={formatMoney(shift.openingCash)}
          />
          <StatTile
            label={t('shifts.expectedCash')}
            value={formatMoney(shift.expectedCash)}
          />
          <StatTile label={t('shifts.cashier')} value={shift.userId} />
        </div>
        {shift.status === 'OPEN' ? (
          <p className="text-ink-subtle text-sm">
            {t('shifts.nightAuditBlocked')}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

interface TodayShiftListProps {
  readonly shifts: Shift[];
  readonly onApprove?: (shiftId: string) => void;
  readonly approvePending?: boolean;
}

export function TodayShiftList({
  shifts,
  onApprove,
  approvePending = false,
}: TodayShiftListProps) {
  const columns: DataTableColumn<Shift>[] = [
    {
      id: 'shiftNumber',
      header: t('shifts.shiftNumber'),
      cell: (shift) => shift.shiftNumber,
    },
    {
      id: 'status',
      header: t('shifts.status'),
      cell: (shift) => (
        <StatusBadge
          tone={STATUS_TONE[shift.status]}
          label={statusLabel(shift.status)}
          size="sm"
        />
      ),
    },
    {
      id: 'variance',
      header: t('shifts.variance'),
      numeric: true,
      cell: (shift) => (
        <span className={statusToneInk[varianceTone(shift.cashVariance)]}>
          {formatMoney(shift.cashVariance)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('common.actions'),
      cell: (shift) =>
        shift.status === 'CLOSED' && onApprove ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onApprove(shift.id)}
            disabled={approvePending}
          >
            {t('shifts.submitApprove')}
          </Button>
        ) : null,
    },
  ];

  return (
    <Panel title={t('shifts.today')} padding="none">
      {shifts.length === 0 ? (
        <EmptyState title={t('shifts.noShiftHint')} />
      ) : (
        <DataTable
          caption={t('shifts.today')}
          columns={columns}
          rows={shifts}
          rowKey={(shift) => shift.id}
          density="compact"
          stickyHeader
        />
      )}
    </Panel>
  );
}
