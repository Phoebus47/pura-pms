'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('messages.title')}
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          {t('messages.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('messages.compose')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="msg-guest">{t('messages.guestId')}</Label>
            <Input
              id="msg-guest"
              name="guestId"
              className="mt-1"
              value={guestId}
              onChange={(event) => setGuestId(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="msg-direction">{t('messages.direction')}</Label>
            <select
              id="msg-direction"
              name="direction"
              className="border border-rule-mist min-h-11 mt-1 px-3 rounded-md w-full"
              value={direction}
              onChange={(event) =>
                setDirection(event.target.value as 'OUTBOUND' | 'INBOUND')
              }
            >
              <option value="OUTBOUND">{t('messages.outbound')}</option>
              <option value="INBOUND">{t('messages.inbound')}</option>
            </select>
          </div>
          <div>
            <Label htmlFor="msg-content">{t('messages.content')}</Label>
            <textarea
              id="msg-content"
              name="content"
              className="border border-rule-mist min-h-24 mt-1 p-3 rounded-md w-full"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>
          <Button
            type="button"
            className="min-h-11"
            disabled={
              !guestId.trim() || !content.trim() || createMessage.isPending
            }
            onClick={() => void handleCreate()}
          >
            {t('messages.send')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('messages.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && rows.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('messages.empty')}
            </p>
          ) : null}
          <ul className="space-y-3">
            {rows.map((row) => (
              <li
                key={row.id}
                className="border border-rule-mist p-3 rounded-md"
              >
                <p className="font-semibold text-foreground">
                  {row.guest
                    ? `${row.guest.firstName} ${row.guest.lastName}`
                    : row.guestId}
                  {' · '}
                  {directionLabel(row.direction)}
                  {!row.readAt ? ` · ${t('messages.unread')}` : ''}
                </p>
                <p className="mt-1 text-foreground text-sm">{row.content}</p>
                {!row.readAt ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 mt-2"
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
        </CardContent>
      </Card>
    </div>
  );
}
