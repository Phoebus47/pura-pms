'use client';

import { useEffect, useState } from 'react';
import { t } from '@/lib/i18n';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    globalThis.addEventListener('online', sync);
    globalThis.addEventListener('offline', sync);
    return () => {
      globalThis.removeEventListener('online', sync);
      globalThis.removeEventListener('offline', sync);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      className="bg-pura-orange px-4 py-2 text-center text-sm text-white"
      role="status"
      aria-live="polite"
    >
      {t('pwa.offlineBanner')}
    </div>
  );
}
