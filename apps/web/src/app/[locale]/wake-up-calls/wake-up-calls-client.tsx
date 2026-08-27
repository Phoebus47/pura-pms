'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { Toolbar } from '@/components/shared/toolbar';
import { propertiesAPI } from '@/lib/api/properties';
import type { StatusTone } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCancelWakeUpCall,
  useCompleteWakeUpCall,
  useMissWakeUpCall,
  useWakeUpCalls,
} from '@/hooks/use-wake-up-calls';
import type { WakeUpCall } from '@/lib/api/wake-up-calls';

function statusLabel(status: WakeUpCall['status']): string {
  if (status === 'SCHEDULED') return t('wakeUpCalls.statusScheduled');
  if (status === 'COMPLETED') return t('wakeUpCalls.statusCompleted');
  if (status === 'MISSED') return t('wakeUpCalls.statusMissed');
  return t('wakeUpCalls.statusCancelled');
}

function statusTone(status: WakeUpCall['status']): StatusTone {
  if (status === 'SCHEDULED') return 'info';
  if (status === 'COMPLETED') return 'positive';
  if (status === 'MISSED') return 'critical';
  return 'neutral';
}

function toDateInput(value: string | Date | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

export function WakeUpCallsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const property = properties?.[0];
  const propertyId = property?.id;
  const [scheduledDate, setScheduledDate] = useState('');

  const effectiveDate = scheduledDate || toDateInput(property?.businessDate);
  const { data: calls = [], isLoading } = useWakeUpCalls({
    propertyId,
    scheduledDate: effectiveDate,
  });
  const completeCall = useCompleteWakeUpCall();
  const missCall = useMissWakeUpCall();
  const cancelCall = useCancelWakeUpCall();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('wakeUpCalls.title')}
        subtitle={t('wakeUpCalls.subtitle')}
      />

      <Panel title={t('wakeUpCalls.list')}>
        <div className="space-y-4">
          <Toolbar
            filters={
              <div className="space-y-2">
                <Label htmlFor="wake-up-date">
                  {t('wakeUpCalls.scheduledDate')}
                </Label>
                <Input
                  id="wake-up-date"
                  name="scheduledDate"
                  type="date"
                  className="max-w-xs"
                  value={effectiveDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                />
              </div>
            }
          />

          {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
          {!isLoading && calls.length === 0 ? (
            <EmptyState
              icon={<AlarmClock className="h-10 w-10" />}
              title={t('wakeUpCalls.empty')}
            />
          ) : null}

          <ul className="space-y-3">
            {calls.map((call) => {
              const guest = call.reservation?.guest;
              const guestName = guest
                ? `${guest.firstName} ${guest.lastName}`
                : '—';
              return (
                <li
                  key={call.id}
                  className="border border-rule-mist p-4 rounded-lg space-y-2"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    <p className="font-semibold text-ink-strong">
                      {t('wakeUpCalls.room')} {call.room?.number ?? '—'} ·{' '}
                      {guestName}
                    </p>
                    <StatusBadge
                      tone={statusTone(call.status)}
                      label={statusLabel(call.status)}
                      size="sm"
                    />
                  </div>
                  <p className="text-ink-subtle text-sm">
                    {call.reservation?.confirmNumber} ·{' '}
                    {new Date(call.scheduledAt).toLocaleString()}
                  </p>
                  {call.status === 'SCHEDULED' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={() =>
                          void completeCall
                            .mutateAsync({ id: call.id, completedBy: userId })
                            .then(() =>
                              toast.success(t('wakeUpCalls.completeSuccess')),
                            )
                            .catch(() =>
                              toast.error(t('wakeUpCalls.actionFailed')),
                            )
                        }
                      >
                        {t('wakeUpCalls.markCompleted')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void missCall
                            .mutateAsync({ id: call.id, missedBy: userId })
                            .then(() =>
                              toast.success(t('wakeUpCalls.missSuccess')),
                            )
                            .catch(() =>
                              toast.error(t('wakeUpCalls.actionFailed')),
                            )
                        }
                      >
                        {t('wakeUpCalls.markMissed')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-status-critical-ink"
                        onClick={() =>
                          void cancelCall
                            .mutateAsync({ id: call.id, cancelledBy: userId })
                            .then(() =>
                              toast.success(t('wakeUpCalls.cancelSuccess')),
                            )
                            .catch(() =>
                              toast.error(t('wakeUpCalls.actionFailed')),
                            )
                        }
                      >
                        {t('wakeUpCalls.cancel')}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
