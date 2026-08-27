'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { propertiesAPI } from '@/lib/api/properties';
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
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('wakeUpCalls.title')}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t('wakeUpCalls.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('wakeUpCalls.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="wake-up-date">
              {t('wakeUpCalls.scheduledDate')}
            </Label>
            <Input
              id="wake-up-date"
              name="scheduledDate"
              type="date"
              className="max-w-xs mt-1"
              value={effectiveDate}
              onChange={(event) => setScheduledDate(event.target.value)}
            />
          </div>

          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && calls.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('wakeUpCalls.empty')}
            </p>
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
                  className="border border-rule-mist p-3 rounded-md"
                >
                  <p className="font-semibold text-foreground">
                    {t('wakeUpCalls.room')} {call.room?.number ?? '—'} ·{' '}
                    {guestName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {call.reservation?.confirmNumber} ·{' '}
                    {new Date(call.scheduledAt).toLocaleString()} ·{' '}
                    {statusLabel(call.status)}
                  </p>
                  {call.status === 'SCHEDULED' ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button
                        type="button"
                        className="min-h-11"
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
                        className="min-h-11"
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
                        className="min-h-11 text-red-600"
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
        </CardContent>
      </Card>
    </div>
  );
}
