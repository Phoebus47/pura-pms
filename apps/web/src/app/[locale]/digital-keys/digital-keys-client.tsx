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
import { useDigitalKeys, useRevokeDigitalKey } from '@/hooks/use-digital-keys';
import { digitalKeysAPI } from '@/lib/api/digital-keys';
import type { DigitalKey, DigitalKeyTransport } from '@/lib/api/digital-keys';

function statusLabel(status: DigitalKey['status']): string {
  if (status === 'ACTIVE') return t('digitalKey.statusActive');
  if (status === 'REVOKED') return t('digitalKey.statusRevoked');
  return t('digitalKey.statusExpired');
}

export function DigitalKeysClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;

  const {
    data: keys = [],
    isLoading,
    refetch,
  } = useDigitalKeys({
    propertyId,
  });
  const revokeKey = useRevokeDigitalKey();

  const [confirmNumber, setConfirmNumber] = useState('');
  const [transport, setTransport] = useState<DigitalKeyTransport>('BLE');
  const [issuing, setIssuing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleIssue() {
    const trimmed = confirmNumber.trim();
    if (!trimmed) return;
    setIssuing(true);
    try {
      await digitalKeysAPI.issueByConfirmNumber({
        confirmNumber: trimmed,
        issuedBy: userId,
        transport,
      });
      toast.success(t('digitalKey.issueSuccess'));
      setConfirmNumber('');
      await refetch();
    } catch {
      toast.error(t('digitalKey.issueFailed'));
    } finally {
      setIssuing(false);
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
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('digitalKey.title')}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t('digitalKey.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('digitalKey.issueTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="gap-3 grid sm:grid-cols-[1fr_auto]">
            <div>
              <Label htmlFor="digital-key-confirm-number">
                {t('digitalKey.confirmNumber')}
              </Label>
              <Input
                id="digital-key-confirm-number"
                name="confirmNumber"
                value={confirmNumber}
                onChange={(event) => setConfirmNumber(event.target.value)}
                placeholder={t('digitalKey.confirmNumberPlaceholder')}
                className="mt-1"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="digital-key-page-transport">
                {t('digitalKey.transport')}
              </Label>
              <select
                id="digital-key-page-transport"
                name="transport"
                className="border border-rule-mist min-h-11 mt-1 px-3 rounded-md w-full"
                value={transport}
                onChange={(event) =>
                  setTransport(event.target.value as DigitalKeyTransport)
                }
              >
                <option value="BLE">{t('digitalKey.transportBle')}</option>
                <option value="NFC">{t('digitalKey.transportNfc')}</option>
              </select>
            </div>
          </div>
          <Button
            type="button"
            className="min-h-11"
            onClick={() => void handleIssue()}
            disabled={issuing || !confirmNumber.trim()}
          >
            {t('digitalKey.issue')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('digitalKey.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && keys.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('digitalKey.empty')}
            </p>
          ) : null}

          <ul className="space-y-3">
            {keys.map((key) => (
              <li
                key={key.id}
                className="border border-rule-mist p-3 rounded-md"
              >
                <p className="font-semibold text-foreground">
                  {t('digitalKey.room')} {key.roomNumber} · {key.transport} ·{' '}
                  {statusLabel(key.status)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {key.reservation?.confirmNumber} · {t('digitalKey.expiresAt')}
                  : {new Date(key.expiresAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  <Input
                    id={`digital-key-list-token-${key.id}`}
                    name={`token-${key.id}`}
                    readOnly
                    value={key.token}
                    aria-label={t('digitalKey.token')}
                    className="flex-1 font-mono min-w-0 text-xs"
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
                  {key.status === 'ACTIVE' ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11 text-red-600"
                      onClick={() => void handleRevoke(key.id)}
                    >
                      {t('digitalKey.revoke')}
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
