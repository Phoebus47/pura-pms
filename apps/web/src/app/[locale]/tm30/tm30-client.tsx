'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { propertiesAPI } from '@/lib/api/properties';
import { tm30ReportsAPI, type Tm30Report } from '@/lib/api/tm30-reports';
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

function statusLabel(status: Tm30Report['status']): string {
  if (status === 'PENDING') return t('tm30.statusPending');
  if (status === 'SUBMITTED') return t('tm30.statusSubmitted');
  if (status === 'CONFIRMED') return t('tm30.statusConfirmed');
  return t('tm30.statusFailed');
}

function isOverdue(row: Tm30Report): boolean {
  return row.status === 'PENDING' && new Date(row.dueAt).getTime() < Date.now();
}

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
  const overdueCount = reports.filter(isOverdue).length;

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
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('tm30.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('tm30.subtitle')}</p>
      </header>

      {overdueCount > 0 ? (
        <p className="font-medium text-amber-800 text-sm" role="status">
          {t('tm30.overdueAlert').replace('{count}', String(overdueCount))}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          disabled={!propertyId || generate.isPending}
          onClick={() => void handleGenerate()}
        >
          {t('tm30.generate')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={!propertyId}
          onClick={() => void handleExport()}
        >
          {t('tm30.export')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('tm30.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && reports.length === 0 ? (
            <p className="text-slate-600 text-sm">{t('tm30.empty')}</p>
          ) : null}
          <ul className="space-y-3">
            {reports.map((row) => (
              <li
                key={row.id}
                className="border border-slate-200 p-3 rounded-md"
              >
                <p className="font-semibold text-slate-800">
                  {row.fullName} · {t('tm30.room')} {row.roomNumber}
                  {isOverdue(row) ? ` · ${t('tm30.overdue')}` : ''}
                </p>
                <p className="text-slate-600 text-sm">
                  {row.nationality} · {row.passportNumber} ·{' '}
                  {statusLabel(row.status)}
                </p>
                {row.status === 'PENDING' ? (
                  <Button
                    type="button"
                    className="min-h-11 mt-2"
                    onClick={() =>
                      void submit
                        .mutateAsync({ id: row.id, submittedBy: userId })
                        .then(() => toast.success(t('tm30.submitSuccess')))
                        .catch(() => toast.error(t('tm30.actionFailed')))
                    }
                  >
                    {t('tm30.submit')}
                  </Button>
                ) : null}
                {row.status === 'SUBMITTED' ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      type="button"
                      className="min-h-11"
                      onClick={() =>
                        void confirm
                          .mutateAsync(row.id)
                          .then(() => toast.success(t('tm30.confirmSuccess')))
                          .catch(() => toast.error(t('tm30.actionFailed')))
                      }
                    >
                      {t('tm30.confirm')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      onClick={() =>
                        void fail
                          .mutateAsync({
                            id: row.id,
                            failureReason: t('tm30.defaultFailReason'),
                          })
                          .then(() => toast.success(t('tm30.failSuccess')))
                          .catch(() => toast.error(t('tm30.actionFailed')))
                      }
                    >
                      {t('tm30.fail')}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
