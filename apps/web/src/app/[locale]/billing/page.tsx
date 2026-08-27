import { Suspense } from 'react';
import { BillingClient } from './billing-client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { t } from '@/lib/i18n';

export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingSpinner message={t('billing.loading')} />}>
      <BillingClient />
    </Suspense>
  );
}
