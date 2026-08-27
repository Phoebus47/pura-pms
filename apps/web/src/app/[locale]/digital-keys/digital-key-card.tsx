'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/status-badge';
import type { DigitalKey } from '@/lib/api/digital-keys';
import type { StatusTone } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

function statusLabel(status: DigitalKey['status']): string {
  if (status === 'ACTIVE') return t('digitalKey.statusActive');
  if (status === 'REVOKED') return t('digitalKey.statusRevoked');
  return t('digitalKey.statusExpired');
}

function statusTone(status: DigitalKey['status']): StatusTone {
  if (status === 'ACTIVE') return 'positive';
  if (status === 'REVOKED') return 'critical';
  return 'neutral';
}

interface DigitalKeyCardProps {
  readonly digitalKey: DigitalKey;
  readonly isCopied: boolean;
  readonly onCopy: (id: string, token: string) => void;
  readonly onRevoke: (id: string) => void;
}

export function DigitalKeyCard({
  digitalKey,
  isCopied,
  onCopy,
  onRevoke,
}: DigitalKeyCardProps) {
  return (
    <li className="border border-rule-mist p-4 rounded-lg space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        <p className="font-semibold text-ink-strong">
          {t('digitalKey.room')} {digitalKey.roomNumber} ·{' '}
          {digitalKey.transport}
        </p>
        <StatusBadge
          tone={statusTone(digitalKey.status)}
          label={statusLabel(digitalKey.status)}
          size="sm"
        />
      </div>
      <p className="text-ink-subtle text-sm">
        {digitalKey.reservation?.confirmNumber} · {t('digitalKey.expiresAt')}:{' '}
        {new Date(digitalKey.expiresAt).toLocaleString()}
      </p>
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          id={`digital-key-list-token-${digitalKey.id}`}
          name={`token-${digitalKey.id}`}
          readOnly
          value={digitalKey.token}
          aria-label={t('digitalKey.token')}
          className="flex-1 font-mono min-w-0 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => onCopy(digitalKey.id, digitalKey.token)}
        >
          {isCopied ? t('digitalKey.copied') : t('digitalKey.copyToken')}
        </Button>
        {digitalKey.status === 'ACTIVE' ? (
          <Button
            type="button"
            variant="outline"
            className="text-status-critical-ink"
            onClick={() => onRevoke(digitalKey.id)}
          >
            {t('digitalKey.revoke')}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
