'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import { nightAuditAPI, NightAuditStatus } from '@/lib/api/night-audit';
import { propertiesAPI } from '@/lib/api/properties';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { StatTile } from '@/components/shared/stat-tile';
import { getDateLocale, t } from '@/lib/i18n';
import { AuditStatusPanel } from './audit-status-panel';
import { AuditErrorsPanel, AuditReportsPanel } from './audit-output-panels';

export default function NightAuditPage() {
  const queryClient = useQueryClient();

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });

  const property = properties?.[0];
  const propertyId = property?.id;
  const businessDate = property?.businessDate;

  const { data: status } = useQuery<NightAuditStatus>({
    queryKey: ['night-audit-status', propertyId, businessDate],
    queryFn: () =>
      nightAuditAPI.getStatus(propertyId as string, businessDate as string),
    enabled: !!propertyId && !!businessDate,
    refetchInterval: (query: unknown) => {
      const q = query as { state?: { data?: NightAuditStatus } };
      return q?.state?.data?.status === 'IN_PROGRESS' ? 3000 : false;
    },
  });

  const startMutation = useMutation({
    mutationFn: () =>
      nightAuditAPI.start(propertyId as string, businessDate as string),
    onSuccess: () => {
      toast.success(t('nightAudit.startSuccess'));
      queryClient.invalidateQueries({ queryKey: ['night-audit-status'] });
    },
    onError: (error: Error) => {
      toast.error(`${t('nightAudit.startFailed')}: ${error.message}`);
    },
  });

  if (!property) {
    return <LoadingSpinner message={t('nightAudit.loading')} />;
  }

  const dateLocale = getDateLocale();
  const businessDateLabel = new Date(property.businessDate).toLocaleDateString(
    dateLocale,
  );
  const errors = status?.errors ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('nightAudit.title')}
        subtitle={property.name}
        actions={
          <StatTile
            label={t('nightAudit.businessDate')}
            value={businessDateLabel}
            icon={<Clock className="size-5" aria-hidden="true" />}
            className="min-w-52"
          />
        }
      />

      <AuditStatusPanel
        status={status}
        businessDateLabel={businessDateLabel}
        dateLocale={dateLocale}
        starting={startMutation.isPending}
        onStart={() => startMutation.mutate()}
      />

      <div className="gap-6 grid md:grid-cols-2">
        {errors.length > 0 && <AuditErrorsPanel errors={errors} />}
        <AuditReportsPanel reports={status?.reports ?? []} />
      </div>
    </div>
  );
}
