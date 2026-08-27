'use client';

import { useQuery } from '@tanstack/react-query';
import { MessageCircleWarning } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCloseGuestComplaint,
  useCreateGuestComplaint,
  useGuestComplaints,
  useResolveGuestComplaint,
  useStartGuestComplaint,
} from '@/hooks/use-guest-complaints';
import { ComplaintCard } from './complaint-card';
import {
  ComplaintLogForm,
  type ComplaintLogValues,
} from './complaint-log-form';

export function ComplaintsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: rows = [], isLoading } = useGuestComplaints({ propertyId });
  const createComplaint = useCreateGuestComplaint();
  const startComplaint = useStartGuestComplaint();
  const resolveComplaint = useResolveGuestComplaint();
  const closeComplaint = useCloseGuestComplaint();

  async function handleCreate(values: ComplaintLogValues): Promise<boolean> {
    if (!propertyId || !values.category || !values.subject) return false;
    if (!values.description) return false;
    try {
      await createComplaint.mutateAsync({
        propertyId,
        ...values,
        openedBy: userId,
      });
      toast.success(t('complaints.createSuccess'));
      return true;
    } catch {
      toast.error(t('complaints.createFailed'));
      return false;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('complaints.title')}
        subtitle={t('complaints.subtitle')}
      />

      <Panel title={t('complaints.record')}>
        <ComplaintLogForm
          isPending={createComplaint.isPending}
          onSubmit={handleCreate}
        />
      </Panel>

      <Panel title={t('complaints.list')}>
        {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
        {!isLoading && rows.length === 0 ? (
          <EmptyState
            icon={<MessageCircleWarning className="h-10 w-10" />}
            title={t('complaints.empty')}
          />
        ) : null}
        <ul className="space-y-3">
          {rows.map((row) => (
            <ComplaintCard
              key={row.id}
              complaint={row}
              userId={userId}
              onStart={(id, assignedTo) =>
                startComplaint.mutateAsync({ id, assignedTo })
              }
              onResolve={(id, resolvedBy, resolutionNote) =>
                resolveComplaint.mutateAsync({
                  id,
                  resolvedBy,
                  resolutionNote,
                })
              }
              onClose={(id, closedBy) =>
                closeComplaint.mutateAsync({ id, closedBy })
              }
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
