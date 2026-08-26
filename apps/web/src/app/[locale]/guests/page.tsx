import { Suspense } from 'react';
import { GuestsClient } from './guests-client';
import { t } from '@/lib/i18n';

export default function GuestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"
              aria-hidden
            />
            <p className="mt-4 text-slate-600">{t('common.loadingGuests')}</p>
          </div>
        </div>
      }
    >
      <GuestsClient />
    </Suspense>
  );
}
