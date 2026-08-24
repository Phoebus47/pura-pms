import { t } from '@/lib/i18n';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="font-bold text-(--pura-blue) text-2xl">
        {t('pwa.offlineTitle')}
      </h1>
      <p className="max-w-md text-slate-600 text-sm">{t('pwa.offlineBody')}</p>
      <Button asChild className="min-h-11">
        <Link href="/">{t('pwa.offlineHome')}</Link>
      </Button>
    </div>
  );
}
