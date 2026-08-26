'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PrintDocument } from '@/components/shared/print-document';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useRegistrationCard,
  useRegCardPrintJob,
} from '@/hooks/use-registration-cards';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export function RegistrationCardPrintClient() {
  const params = useParams<{ id: string }>();
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: card, isLoading } = useRegistrationCard(params.id);
  const printJob = useRegCardPrintJob();

  if (isLoading) {
    return <p className="p-6">{t('registrationCard.loading')}</p>;
  }

  if (!card) {
    return <p className="p-6">{t('registrationCard.notFound')}</p>;
  }

  const guest = card.guestSnapshot;
  const stay = card.staySnapshot;
  const property = card.propertySnapshot;

  async function handleHardwarePrint() {
    if (!card) return;
    try {
      await printJob.mutateAsync({
        id: card.id,
        data: { requestedBy: userId },
      });
      toast.success(t('reservations.regCard.printJobSuccess'));
    } catch {
      toast.error(t('reservations.regCard.printJobFailed'));
    }
  }

  return (
    <PrintDocument>
      <header className="space-y-1">
        <h1 className="font-bold text-2xl">
          {t('registrationCard.printTitle')}
        </h1>
        <p>
          {t('registrationCard.confirmNumber')}: {stay.confirmNumber}
        </p>
        <p>
          {t('reservations.regCard.version')}: {card.version}
        </p>
      </header>

      <section>
        <h2 className="font-semibold">{t('registrationCard.property')}</h2>
        <p>{property.name}</p>
        {property.address ? <p>{property.address}</p> : null}
        {property.phone ? <p>{property.phone}</p> : null}
      </section>

      <section>
        <h2 className="font-semibold">{t('registrationCard.guest')}</h2>
        <p>
          {guest.firstName} {guest.lastName}
        </p>
        {guest.phone ? <p>{guest.phone}</p> : null}
        {guest.email ? <p>{guest.email}</p> : null}
        {guest.idType || guest.idNumber ? (
          <p>
            {t('registrationCard.idDocument')}: {guest.idType} {guest.idNumber}
          </p>
        ) : null}
        {guest.nationality ? (
          <p>
            {t('registrationCard.nationality')}: {guest.nationality}
          </p>
        ) : null}
        {guest.address ? (
          <p>
            {t('registrationCard.address')}: {guest.address}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="font-semibold">{t('registrationCard.stay')}</h2>
        <p>
          {t('registrationCard.checkIn')}: {formatDate(stay.checkIn)}
        </p>
        <p>
          {t('registrationCard.checkOut')}: {formatDate(stay.checkOut)}
        </p>
        <p>
          {t('registrationCard.room')}: {stay.roomNumber}
          {stay.roomTypeName ? ` (${stay.roomTypeName})` : ''}
        </p>
      </section>

      {card.signatureData ? (
        <section>
          <h2 className="font-semibold">{t('registrationCard.signature')}</h2>
          <p className="text-slate-600 text-sm">
            {card.signedByGuestName} ·{' '}
            {card.signedAt ? new Date(card.signedAt).toLocaleString() : ''}
          </p>
          <Image
            src={card.signatureData}
            alt={t('registrationCard.signature')}
            width={320}
            height={120}
            className="border border-slate-200 mt-2"
            unoptimized
          />
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button
          type="button"
          className="min-h-11"
          onClick={() => window.print()}
        >
          {t('registrationCard.print')}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => void handleHardwarePrint()}
        >
          {t('registrationCard.printViaBridge')}
        </Button>
      </div>
    </PrintDocument>
  );
}
