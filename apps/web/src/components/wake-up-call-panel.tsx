'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCancelWakeUpCall,
  useCompleteWakeUpCall,
  useCreateWakeUpCall,
  useMissWakeUpCall,
  useWakeUpCalls,
} from '@/hooks/use-wake-up-calls';
import type { WakeUpCall } from '@/lib/api/wake-up-calls';

interface WakeUpCallPanelProps {
  readonly reservation: Reservation;
}

function statusLabel(status: WakeUpCall['status']): string {
  if (status === 'SCHEDULED') return t('wakeUpCalls.statusScheduled');
  if (status === 'COMPLETED') return t('wakeUpCalls.statusCompleted');
  if (status === 'MISSED') return t('wakeUpCalls.statusMissed');
  return t('wakeUpCalls.statusCancelled');
}

export function WakeUpCallPanel({ reservation }: WakeUpCallPanelProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: calls = [] } = useWakeUpCalls({
    reservationId: reservation.id,
  });
  const createCall = useCreateWakeUpCall();
  const completeCall = useCompleteWakeUpCall();
  const missCall = useMissWakeUpCall();
  const cancelCall = useCancelWakeUpCall();
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSchedule() {
    if (!scheduledAt) return;
    try {
      await createCall.mutateAsync({
        reservationId: reservation.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        scheduledBy: userId,
        notes: notes.trim() || undefined,
      });
      toast.success(t('reservations.wakeUpCall.scheduleSuccess'));
      setScheduledAt('');
      setNotes('');
    } catch {
      toast.error(t('reservations.wakeUpCall.scheduleFailed'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reservations.wakeUpCall.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="gap-3 grid sm:grid-cols-2">
          <div>
            <Label htmlFor="wake-up-at">{t('wakeUpCalls.scheduledAt')}</Label>
            <Input
              id="wake-up-at"
              name="scheduledAt"
              type="datetime-local"
              className="mt-1"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="wake-up-notes">{t('wakeUpCalls.notes')}</Label>
            <Input
              id="wake-up-notes"
              name="notes"
              className="mt-1"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          className="min-h-11"
          onClick={() => void handleSchedule()}
          disabled={!scheduledAt || createCall.isPending}
        >
          {t('reservations.wakeUpCall.schedule')}
        </Button>

        {calls.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('wakeUpCalls.empty')}
          </p>
        ) : null}

        <ul className="space-y-3">
          {calls.map((call) => (
            <li
              key={call.id}
              className="border border-rule-mist p-3 rounded-md text-sm"
            >
              <p className="font-semibold text-foreground">
                {new Date(call.scheduledAt).toLocaleString()} ·{' '}
                {statusLabel(call.status)}
              </p>
              {call.notes ? (
                <p className="text-muted-foreground">{call.notes}</p>
              ) : null}
              {call.status === 'SCHEDULED' ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    type="button"
                    className="min-h-11"
                    onClick={() =>
                      void completeCall
                        .mutateAsync({ id: call.id, completedBy: userId })
                        .then(() =>
                          toast.success(t('wakeUpCalls.completeSuccess')),
                        )
                        .catch(() => toast.error(t('wakeUpCalls.actionFailed')))
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
                        .then(() => toast.success(t('wakeUpCalls.missSuccess')))
                        .catch(() => toast.error(t('wakeUpCalls.actionFailed')))
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
                        .catch(() => toast.error(t('wakeUpCalls.actionFailed')))
                    }
                  >
                    {t('wakeUpCalls.cancel')}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
