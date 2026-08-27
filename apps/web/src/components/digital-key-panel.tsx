'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Reservation } from '@/lib/api';
import type { DigitalKey, DigitalKeyTransport } from '@/lib/api/digital-keys';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useDigitalKeys,
  useIssueDigitalKey,
  useRevokeDigitalKey,
} from '@/hooks/use-digital-keys';

interface DigitalKeyPanelProps {
  readonly reservation: Reservation;
}

function statusLabel(status: DigitalKey['status']): string {
  if (status === 'ACTIVE') return t('digitalKey.statusActive');
  if (status === 'REVOKED') return t('digitalKey.statusRevoked');
  return t('digitalKey.statusExpired');
}

export function DigitalKeyPanel({ reservation }: DigitalKeyPanelProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: keys = [] } = useDigitalKeys({
    reservationId: reservation.id,
  });
  const issueKey = useIssueDigitalKey();
  const revokeKey = useRevokeDigitalKey();
  const [transport, setTransport] = useState<DigitalKeyTransport>('BLE');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleIssue() {
    try {
      await issueKey.mutateAsync({
        reservationId: reservation.id,
        issuedBy: userId,
        transport,
      });
      toast.success(t('digitalKey.issueSuccess'));
    } catch {
      toast.error(t('digitalKey.issueFailed'));
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeKey.mutateAsync({ id, data: { revokedBy: userId } });
      toast.success(t('digitalKey.revokeSuccess'));
    } catch {
      toast.error(t('digitalKey.revokeFailed'));
    }
  }

  async function handleCopy(id: string, token: string) {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t('digitalKey.issueFailed'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reservations.digitalKey.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <Label htmlFor="digital-key-transport">
              {t('digitalKey.transport')}
            </Label>
            <select
              id="digital-key-transport"
              name="transport"
              className="border border-rule-mist min-h-11 mt-1 px-3 rounded-md"
              value={transport}
              onChange={(event) =>
                setTransport(event.target.value as DigitalKeyTransport)
              }
            >
              <option value="BLE">{t('digitalKey.transportBle')}</option>
              <option value="NFC">{t('digitalKey.transportNfc')}</option>
            </select>
          </div>
          <Button
            type="button"
            className="min-h-11"
            onClick={() => void handleIssue()}
            disabled={issueKey.isPending}
          >
            {t('reservations.digitalKey.issue')}
          </Button>
        </div>

        {keys.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('digitalKey.empty')}
          </p>
        ) : null}

        <ul className="space-y-3">
          {keys.map((key) => (
            <li
              key={key.id}
              className="border border-rule-mist p-3 rounded-md text-sm"
            >
              <p className="font-semibold text-foreground">
                {t('digitalKey.room')} {key.roomNumber} · {key.transport} ·{' '}
                {statusLabel(key.status)}
              </p>
              <div className="gap-2 grid mt-2 sm:grid-cols-[1fr_auto]">
                <Input
                  id={`digital-key-token-${key.id}`}
                  name={`token-${key.id}`}
                  readOnly
                  value={key.token}
                  aria-label={t('digitalKey.token')}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => void handleCopy(key.id, key.token)}
                >
                  {copiedId === key.id
                    ? t('digitalKey.copied')
                    : t('digitalKey.copyToken')}
                </Button>
              </div>
              <p className="mt-2 text-muted-foreground">
                {t('digitalKey.expiresAt')}:{' '}
                {new Date(key.expiresAt).toLocaleString()}
              </p>
              {key.status === 'ACTIVE' ? (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 text-red-600"
                    onClick={() => void handleRevoke(key.id)}
                  >
                    {t('digitalKey.revoke')}
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
