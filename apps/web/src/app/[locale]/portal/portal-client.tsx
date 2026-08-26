'use client';

import { useState } from 'react';
import { portalAPI } from '@/lib/api/portal';
import type { PortalFolio, PortalReservationSummary } from '@/lib/api/portal';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { PortalFolioCard } from './portal-folio-card';
import { PortalReservationCard } from './portal-reservation-card';
import { PortalRequestForm } from './portal-request-form';
import { PortalUnlockForm } from './portal-unlock-form';

export function PortalClient() {
  const [confirmNumber, setConfirmNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [reservation, setReservation] =
    useState<PortalReservationSummary | null>(null);
  const [folios, setFolios] = useState<PortalFolio[]>([]);
  const [requestContent, setRequestContent] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  async function handleUnlock() {
    const trimmedConfirmNumber = confirmNumber.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedConfirmNumber || !trimmedLastName) return;

    setUnlockLoading(true);
    try {
      const [foundReservation, foundFolios] = await Promise.all([
        portalAPI.getReservation(trimmedConfirmNumber, trimmedLastName),
        portalAPI.getFolio(trimmedConfirmNumber, trimmedLastName),
      ]);
      setReservation(foundReservation);
      setFolios(foundFolios);
    } catch {
      toast.error(t('portal.unlockFailed'));
    } finally {
      setUnlockLoading(false);
    }
  }

  function handleReset() {
    setConfirmNumber('');
    setLastName('');
    setReservation(null);
    setFolios([]);
    setRequestContent('');
  }

  async function handleRequestSubmit() {
    if (!reservation || !requestContent.trim()) return;
    setRequestLoading(true);
    try {
      await portalAPI.requestService(reservation.confirmNumber, {
        lastName: lastName.trim(),
        content: requestContent.trim(),
      });
      setRequestContent('');
      toast.success(t('portal.requestSuccess'));
    } catch {
      toast.error(t('portal.requestFailed'));
    } finally {
      setRequestLoading(false);
    }
  }

  return (
    <div className="flex flex-col max-w-2xl md:p-8 min-h-[70vh] mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="font-bold md:text-5xl text-(--pura-blue) text-4xl">
          {t('portal.title')}
        </h1>
        <p className="mt-2 text-lg text-slate-600">{t('portal.subtitle')}</p>
      </header>

      {!reservation ? (
        <PortalUnlockForm
          confirmNumber={confirmNumber}
          lastName={lastName}
          loading={unlockLoading}
          onConfirmNumberChange={setConfirmNumber}
          onLastNameChange={setLastName}
          onUnlock={() => void handleUnlock()}
        />
      ) : (
        <div className="space-y-6">
          <PortalReservationCard
            reservation={reservation}
            onReset={handleReset}
          />
          <PortalFolioCard folios={folios} />
          <PortalRequestForm
            content={requestContent}
            loading={requestLoading}
            onContentChange={setRequestContent}
            onSubmit={() => void handleRequestSubmit()}
          />
        </div>
      )}
    </div>
  );
}
