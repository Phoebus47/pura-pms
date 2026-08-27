'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { StatusBadge } from '@/components/shared/status-badge';
import { propertiesAPI } from '@/lib/api/properties';
import type { GuestMessage } from '@/lib/api/guest-messages';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCreateGuestMessage,
  useGuestMessages,
  useMarkGuestMessageRead,
} from '@/hooks/use-guest-messages';

const CONTROL_CLASS =
  'h-(--field-h) w-full rounded-md border border-input bg-surface-desk px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

function directionLabel(direction: GuestMessage['direction']): string {
  return direction === 'INBOUND'
    ? t('messages.inbound')
    : t('messages.outbound');
}

export function MessagesClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: rows = [], isLoading } = useGuestMessages({ propertyId });
  const createMessage = useCreateGuestMessage();
  const markRead = useMarkGuestMessageRead();
  const [guestId, setGuestId] = useState('');
  const [content, setContent] = useState('');
  const [direction, setDirection] = useState<'OUTBOUND' | 'INBOUND'>(
    'OUTBOUND',
  );

  async function handleCreate() {
    if (!propertyId || !guestId.trim() || !content.trim()) return;
    try {
      await createMessage.mutateAsync({
        propertyId,
        guestId: guestId.trim(),
        direction,
        content: content.trim(),
        sentBy: direction === 'OUTBOUND' ? userId : undefined,
      });
      toast.success(t('messages.createSuccess'));
      setContent('');
    } catch {
      toast.error(t('messages.createFailed'));
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={t('messages.title')}
        subtitle={t('messages.subtitle')}
      />

      <Panel title={t('messages.compose')}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msg-guest">{t('messages.guestId')}</Label>
            <Input
              id="msg-guest"
              name="guestId"
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg-direction">{t('messages.direction')}</Label>
            <select
              id="msg-direction"
              name="direction"
              className={CONTROL_CLASS}
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as 'OUTBOUND' | 'INBOUND')
              }
            >
              <option value="OUTBOUND">{t('messages.outbound')}</option>
              <option value="INBOUND">{t('messages.inbound')}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="msg-content">{t('messages.content')}</Label>
            <Textarea
              id="msg-content"
              name="content"
              className="min-h-24"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
          <Button
            type="button"
            disabled={
              !guestId.trim() || !content.trim() || createMessage.isPending
            }
            onClick={() => void handleCreate()}
          >
            {t('messages.send')}
          </Button>
        </div>
      </Panel>

      <Panel title={t('messages.list')}>
        {isLoading ? <LoadingSpinner message={t('common.loading')} /> : null}
        {!isLoading && rows.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-10 w-10" />}
            title={t('messages.empty')}
          />
        ) : null}
        <ul className="space-y-3">
          {rows.map((row) => (
            <li
              key={row.id}
              className="border border-rule-mist p-4 rounded-lg space-y-2"
            >
              <div className="flex flex-wrap gap-2 items-center">
                <p className="font-semibold text-ink-strong">
                  {row.guest
                    ? `${row.guest.firstName} ${row.guest.lastName}`
                    : row.guestId}
                </p>
                <StatusBadge
                  tone={row.direction === 'INBOUND' ? 'info' : 'neutral'}
                  label={directionLabel(row.direction)}
                  size="sm"
                />
                {!row.readAt ? (
                  <StatusBadge
                    tone="caution"
                    label={t('messages.unread')}
                    size="sm"
                  />
                ) : null}
              </div>
              <p className="text-ink-default text-sm">{row.content}</p>
              {!row.readAt ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    void markRead
                      .mutateAsync(row.id)
                      .then(() => toast.success(t('messages.readSuccess')))
                      .catch(() => toast.error(t('messages.actionFailed')))
                  }
                >
                  {t('messages.markRead')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
