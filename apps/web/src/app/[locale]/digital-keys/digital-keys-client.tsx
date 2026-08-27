'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { useDigitalKeys, useRevokeDigitalKey } from '@/hooks/use-digital-keys';
import { digitalKeysAPI } from '@/lib/api/digital-keys';
import type { DigitalKeyTransport } from '@/lib/api/digital-keys';
import { DigitalKeyCard } from './digital-key-card';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

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
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('digitalKey.title')}
        subtitle={t('digitalKey.subtitle')}
      />

      <Panel title={t('digitalKey.issueTitle')}>
        <div className="space-y-4">
          <div className="gap-4 grid sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="digital-key-confirm-number">
                {t('digitalKey.confirmNumber')}
              </Label>
              <Input
                id="digital-key-confirm-number"
                name="confirmNumber"
                value={confirmNumber}
                onChange={(event) => setConfirmNumber(event.target.value)}
                placeholder={t('digitalKey.confirmNumberPlaceholder')}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="digital-key-page-transport">
                {t('digitalKey.transport')}
              </Label>
              <select
                id="digital-key-page-transport"
                name="transport"
                className={CONTROL_CLASS}
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
            onClick={() => void handleIssue()}
            disabled={issuing || !confirmNumber.trim()}
          >
            {t('digitalKey.issue')}
          </Button>
        </div>
      </Panel>

      <Panel title={t('digitalKey.list')}>
        {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
        {!isLoading && keys.length === 0 ? (
          <EmptyState
            icon={<KeyRound className="h-10 w-10" />}
            title={t('digitalKey.empty')}
          />
        ) : null}

        <ul className="space-y-3">
          {keys.map((key) => (
            <DigitalKeyCard
              key={key.id}
              digitalKey={key}
              isCopied={copiedId === key.id}
              onCopy={(id, token) => void handleCopy(id, token)}
              onRevoke={(id) => void handleRevoke(id)}
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
