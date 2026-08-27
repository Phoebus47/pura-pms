'use client';

import { AlertCircle, CheckCircle2, Play, RefreshCcw } from 'lucide-react';
import type { NightAuditStatus } from '@/lib/api/night-audit';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import {
  statusToneInk,
  statusToneSurface,
  type StatusTone,
} from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const RUN_TONE: Record<NightAuditStatus['status'], StatusTone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'info',
  COMPLETED: 'positive',
  FAILED: 'critical',
};

function formatAuditStatus(status?: string): string {
  if (!status) {
    return t('nightAudit.status.PENDING');
  }
  const key = `nightAudit.status.${status}`;
  const label = t(key);
  return label === key ? status : label;
}

interface AuditCalloutProps {
  readonly tone: Extract<StatusTone, 'positive' | 'critical'>;
  readonly title: string;
  readonly body: string;
  readonly icon: React.ReactNode;
}

function AuditCallout({ tone, title, body, icon }: AuditCalloutProps) {
  return (
    <div
      className={cn(
        'flex gap-3 items-start p-4 rounded-lg border',
        statusToneSurface[tone],
        statusToneInk[tone],
      )}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{body}</p>
      </div>
    </div>
  );
}

interface AuditStatusPanelProps {
  readonly status: NightAuditStatus | undefined;
  readonly businessDateLabel: string;
  readonly dateLocale: string;
  readonly starting: boolean;
  readonly onStart: () => void;
}

export function AuditStatusPanel({
  status,
  businessDateLabel,
  dateLocale,
  starting,
  onStart,
}: AuditStatusPanelProps) {
  const isCompleted = status?.status === 'COMPLETED';
  const isInProgress = status?.status === 'IN_PROGRESS';
  const isFailed = status?.status === 'FAILED';

  const formatTime = (value?: string) =>
    value ? new Date(value).toLocaleTimeString(dateLocale) : '-';

  return (
    <Panel
      title={t('nightAudit.currentStatus')}
      description={`${t('nightAudit.tracking')} ${businessDateLabel}`}
      actions={
        <Badge tone={RUN_TONE[status?.status ?? 'PENDING']}>
          {formatAuditStatus(status?.status)}
        </Badge>
      }
    >
      <div className="space-y-6">
        <div className="gap-4 grid grid-cols-2 md:grid-cols-4">
          <StatTile
            label={t('nightAudit.roomsPosted')}
            value={status?.roomsPosted || 0}
          />
          <StatTile
            label={t('nightAudit.revenueCaptured')}
            value={`฿${Number(status?.revenuePosted || 0).toLocaleString()}`}
            tone="positive"
          />
          <StatTile
            label={t('nightAudit.startedAt')}
            value={formatTime(status?.startedAt)}
          />
          <StatTile
            label={t('nightAudit.completedAt')}
            value={formatTime(status?.completedAt)}
          />
        </div>

        {isInProgress && (
          <div className="space-y-2">
            <p className="flex font-semibold gap-2 items-center text-sm">
              <RefreshCcw
                className="animate-spin size-4 text-pura-blue"
                aria-hidden="true"
              />
              {t('nightAudit.processing')}
            </p>
            <div className="bg-surface-inset h-2.5 overflow-hidden rounded-full w-full">
              <div
                className="animate-pulse bg-pura-blue duration-500 h-2.5 rounded-full transition-all"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        )}

        {isCompleted && (
          <AuditCallout
            tone="positive"
            title={t('nightAudit.completedTitle')}
            body={t('nightAudit.completedBody')}
            icon={<CheckCircle2 className="size-5" />}
          />
        )}

        {isFailed && (
          <AuditCallout
            tone="critical"
            title={t('nightAudit.failedTitle')}
            body={t('nightAudit.failedBody')}
            icon={<AlertCircle className="size-5" />}
          />
        )}

        <div className="border-rule-mist border-t flex justify-center pt-6">
          {!isCompleted && !isInProgress && (
            <Button size="lg" onClick={onStart} disabled={starting}>
              <Play className="fill-current size-5" aria-hidden="true" />
              {starting ? t('nightAudit.starting') : t('nightAudit.run')}
            </Button>
          )}
          {isInProgress && (
            <Button size="lg" disabled>
              <RefreshCcw className="animate-spin size-5" aria-hidden="true" />
              {t('nightAudit.inProgress')}
            </Button>
          )}
          {isCompleted && (
            <Button
              variant="outline"
              size="lg"
              disabled
              className={cn(
                'border-status-positive-line/40',
                statusToneInk.positive,
              )}
            >
              <CheckCircle2 className="size-5" aria-hidden="true" />
              {t('nightAudit.completedToday')}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
