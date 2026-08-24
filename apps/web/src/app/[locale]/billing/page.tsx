import { Suspense } from 'react';
import { BillingClient } from './billing-client';

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-48 items-center justify-center">
          <div className="animate-spin border-b-2 border-pura-blue h-10 rounded-full w-10" />
          <p className="mt-4 text-slate-600">Loading billing…</p>
        </div>
      }
    >
      <BillingClient />
    </Suspense>
  );
}
