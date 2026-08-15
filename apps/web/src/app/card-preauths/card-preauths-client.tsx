'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { useCardPreauths } from '@/hooks/use-card-preauths';
import { CardPreauthList, HoldCardPreauthForm } from './card-preauth-panels';

export function CardPreauthsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: holds = [] } = useCardPreauths();

  return (
    <div className="max-w-3xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('preauth.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('preauth.subtitle')}</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>{t('preauth.hold')}</CardTitle>
        </CardHeader>
        <CardContent>
          <HoldCardPreauthForm createdBy={userId} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('preauth.list')}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardPreauthList holds={holds} userId={userId} />
        </CardContent>
      </Card>
    </div>
  );
}
