'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignaturePad } from '@/components/signature-pad';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import {
  useRegistrationCard,
  useSignRegistrationCard,
} from '@/hooks/use-registration-cards';

export function RegistrationCardSignClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: card, isLoading } = useRegistrationCard(params.id);
  const signCard = useSignRegistrationCard();
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');

  if (isLoading) {
    return <p className="p-6">{t('registrationCard.loading')}</p>;
  }

  if (!card) {
    return <p className="p-6">{t('registrationCard.notFound')}</p>;
  }

  const defaultName =
    `${card.guestSnapshot.firstName} ${card.guestSnapshot.lastName}`.trim();

  async function handleSubmit() {
    if (!card) return;
    if (!signatureData) {
      toast.error(t('registrationCard.signatureRequired'));
      return;
    }
    const signedByGuestName = guestName.trim() || defaultName;
    if (!signedByGuestName) {
      toast.error(t('registrationCard.nameRequired'));
      return;
    }
    try {
      await signCard.mutateAsync({
        id: card.id,
        data: { signatureData, signedByGuestName },
      });
      toast.success(t('registrationCard.signSuccess'));
      router.push(`/registration-cards/${card.id}/print`);
    } catch {
      toast.error(t('registrationCard.signFailed'));
    }
  }

  return (
    <article className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="font-bold text-2xl text-pura-blue">
          {t('registrationCard.signTitle')}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t('registrationCard.signHint')}
        </p>
        <p className="mt-1 text-foreground">
          {card.staySnapshot.confirmNumber} · {card.staySnapshot.roomNumber}
        </p>
      </header>

      <div>
        <Label htmlFor="guest-name">{t('registrationCard.guestName')}</Label>
        <Input
          id="guest-name"
          name="guestName"
          className="mt-1"
          placeholder={t('registrationCard.guestNamePlaceholder')}
          defaultValue={defaultName}
          onChange={(event) => setGuestName(event.target.value)}
        />
      </div>

      <SignaturePad onChange={setSignatureData} />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11"
          onClick={() => void handleSubmit()}
          disabled={signCard.isPending}
        >
          {t('registrationCard.submit')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => router.back()}
        >
          {t('common.cancel')}
        </Button>
      </div>
    </article>
  );
}
