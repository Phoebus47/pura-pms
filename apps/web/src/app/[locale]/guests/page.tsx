import { Suspense } from 'react';
import { GuestsClient } from './guests-client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { t } from '@/lib/i18n';

export default function GuestsPage() {
  return (
    <Suspense fallback={<LoadingSpinner message={t('common.loadingGuests')} />}>
      <GuestsClient />
    </Suspense>
  );
}
