'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useCreateRegistrationCard,
  useRegistrationCards,
  useRegCardPrintJob,
  useVoidRegistrationCard,
} from '@/hooks/use-registration-cards';
import type { RegistrationCard } from '@/lib/api/registration-cards';

interface RegistrationCardPanelProps {
  readonly reservation: Reservation;
}

function statusLabel(status: RegistrationCard['status']): string {
  if (status === 'DRAFT') return t('reservations.regCard.statusDraft');
  if (status === 'SIGNED') return t('reservations.regCard.statusSigned');
  return t('reservations.regCard.statusVoid');
}

export function RegistrationCardPanel({
  reservation,
}: RegistrationCardPanelProps) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: cards = [], isLoading } = useRegistrationCards(reservation.id);
  const createDraft = useCreateRegistrationCard();
  const voidCard = useVoidRegistrationCard();
  const printJob = useRegCardPrintJob();
  const [voidReason, setVoidReason] = useState('');

  const latest = cards[0];
  const hasSigned = useMemo(
    () => cards.some((card) => card.status === 'SIGNED'),
    [cards],
  );
  const showWarning =
    reservation.status === 'CONFIRMED' && !hasSigned && !isLoading;

  async function handleCreateDraft() {
    try {
      const card = await createDraft.mutateAsync({
        reservationId: reservation.id,
        createdBy: userId,
      });
      toast.success(t('reservations.regCard.createSuccess'));
      window.location.assign(`/registration-cards/${card.id}/sign`);
    } catch {
      toast.error(t('reservations.regCard.createFailed'));
    }
  }

  async function handleVoid(cardId: string) {
    if (!voidReason.trim()) return;
    try {
      await voidCard.mutateAsync({
        id: cardId,
        data: { reason: voidReason.trim(), voidedBy: userId },
      });
      toast.success(t('reservations.regCard.voidSuccess'));
      setVoidReason('');
    } catch {
      toast.error(t('reservations.regCard.voidFailed'));
    }
  }

  async function handlePrint(cardId: string) {
    try {
      await printJob.mutateAsync({
        id: cardId,
        data: { requestedBy: userId },
      });
      toast.success(t('reservations.regCard.printJobSuccess'));
    } catch {
      toast.error(t('reservations.regCard.printJobFailed'));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reservations.regCard.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWarning ? (
          <p
            className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-900 text-sm"
            role="status"
          >
            {t('reservations.regCard.unsignedWarning')}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="min-h-11"
            onClick={() => void handleCreateDraft()}
            disabled={createDraft.isPending}
          >
            {t('reservations.regCard.createDraft')}
          </Button>
          {latest?.status === 'DRAFT' ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              asChild
            >
              <Link href={`/registration-cards/${latest.id}/sign`}>
                {t('reservations.regCard.openSign')}
              </Link>
            </Button>
          ) : null}
          {latest?.status === 'SIGNED' ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                asChild
              >
                <Link href={`/registration-cards/${latest.id}/print`}>
                  {t('reservations.regCard.openPrint')}
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => void handlePrint(latest.id)}
              >
                {t('registrationCard.printViaBridge')}
              </Button>
            </>
          ) : null}
        </div>

        {cards.length === 0 && !isLoading ? (
          <p className="text-slate-600 text-sm">
            {t('reservations.regCard.empty')}
          </p>
        ) : null}

        <ul className="space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className="border border-slate-200 p-3 rounded-md text-sm"
            >
              <p className="font-semibold text-slate-800">
                {t('reservations.regCard.version')} {card.version} ·{' '}
                {statusLabel(card.status)}
              </p>
              {card.signedAt ? (
                <p className="text-slate-600">
                  {t('reservations.regCard.signedAt')}:{' '}
                  {new Date(card.signedAt).toLocaleString()}
                </p>
              ) : null}
              {card.signedByGuestName ? (
                <p className="text-slate-600">
                  {t('reservations.regCard.signedBy')}: {card.signedByGuestName}
                </p>
              ) : null}
              {card.status === 'SIGNED' ? (
                <div className="gap-2 grid mt-2 sm:grid-cols-[1fr_auto]">
                  <div>
                    <Label htmlFor={`void-reason-${card.id}`}>
                      {t('reservations.regCard.voidReason')}
                    </Label>
                    <Input
                      id={`void-reason-${card.id}`}
                      name={`void-reason-${card.id}`}
                      value={voidReason}
                      onChange={(event) => setVoidReason(event.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-11 self-end text-red-600"
                    onClick={() => void handleVoid(card.id)}
                  >
                    {t('reservations.regCard.void')}
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
