'use client';

import { useQuery } from '@tanstack/react-query';
import { FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatTile } from '@/components/shared/stat-tile';
import { propertiesAPI } from '@/lib/api/properties';
import { tm30ReportsAPI } from '@/lib/api/tm30-reports';
import { statusToneSurface } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useConfirmTm30Report,
  useFailTm30Report,
  useGenerateTm30Reports,
  useSubmitTm30Report,
  useTm30Reports,
} from '@/hooks/use-tm30-reports';
import { isTm30Overdue, Tm30ReportCard } from './tm30-report-card';

export function Tm30ReportsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: reports = [], isLoading } = useTm30Reports({ propertyId });
  const generate = useGenerateTm30Reports();
  const submit = useSubmitTm30Report();
  const confirm = useConfirmTm30Report();
  const fail = useFailTm30Report();
  const overdueCount = reports.filter(isTm30Overdue).length;
  const pendingCount = reports.filter((row) => row.status === 'PENDING').length;

  async function handleGenerate() {
    if (!propertyId) return;
    try {
      const result = await generate.mutateAsync({
        propertyId,
        generatedBy: userId,
      });
      toast.success(
        t('tm30.generateSuccess').replace(
          '{count}',
          String(result.created.length),
        ),
      );
    } catch {
      toast.error(t('tm30.generateFailed'));
    }
  }

  async function handleExport() {
    if (!propertyId) return;
    try {
      const file = await tm30ReportsAPI.exportTsv(propertyId);
      const blob = new Blob([file.text], { type: 'text/tab-separated-values' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t('tm30.exportSuccess'));
    } catch {
      toast.error(t('tm30.exportFailed'));
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('tm30.title')}
        subtitle={t('tm30.subtitle')}
        actions={
          <>
            <Button
              type="button"
              disabled={!propertyId || generate.isPending}
              onClick={() => void handleGenerate()}
            >
              {t('tm30.generate')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!propertyId}
              onClick={() => void handleExport()}
            >
              {t('tm30.export')}
            </Button>
          </>
        }
      />

      <div className="gap-4 grid grid-cols-2 sm:grid-cols-3">
        <StatTile
          label={t('tm30.overdue')}
          value={overdueCount}
          tone={overdueCount > 0 ? 'critical' : 'neutral'}
        />
        <StatTile
          label={t('tm30.statusPending')}
          value={pendingCount}
          tone={pendingCount > 0 ? 'caution' : 'neutral'}
        />
        <StatTile label={t('tm30.totalReports')} value={reports.length} />
      </div>

      {overdueCount > 0 ? (
        <p
          className={`${statusToneSurface.critical} border font-medium p-4 rounded-xl text-ink-default text-sm`}
          role="status"
        >
          {t('tm30.overdueAlert').replace('{count}', String(overdueCount))}
        </p>
      ) : null}

      <Panel title={t('tm30.list')}>
        {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
        {!isLoading && reports.length === 0 ? (
          <EmptyState
            icon={<FileWarning className="h-10 w-10" />}
            title={t('tm30.empty')}
          />
        ) : null}
        <ul className="space-y-3">
          {reports.map((row) => (
            <Tm30ReportCard
              key={row.id}
              report={row}
              onSubmit={(id) =>
                void submit
                  .mutateAsync({ id, submittedBy: userId })
                  .then(() => toast.success(t('tm30.submitSuccess')))
                  .catch(() => toast.error(t('tm30.actionFailed')))
              }
              onConfirm={(id) =>
                void confirm
                  .mutateAsync(id)
                  .then(() => toast.success(t('tm30.confirmSuccess')))
                  .catch(() => toast.error(t('tm30.actionFailed')))
              }
              onFail={(id) =>
                void fail
                  .mutateAsync({
                    id,
                    failureReason: t('tm30.defaultFailReason'),
                  })
                  .then(() => toast.success(t('tm30.failSuccess')))
                  .catch(() => toast.error(t('tm30.actionFailed')))
              }
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
