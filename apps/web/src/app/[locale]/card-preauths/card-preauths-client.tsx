'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { t } from '@/lib/i18n';
import { propertiesAPI } from '@/lib/api/properties';
import { useCardPreauths } from '@/hooks/use-card-preauths';
import { HoldCardPreauthForm } from './card-preauth-panels';
import { CardPreauthList } from './card-preauth-list';

export function CardPreauthsClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: holds = [] } = useCardPreauths();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title={t('preauth.title')} subtitle={t('preauth.subtitle')} />
      <Panel title={t('preauth.hold')}>
        <HoldCardPreauthForm createdBy={userId} />
      </Panel>
      <Panel title={t('preauth.list')} padding="none">
        <CardPreauthList
          holds={holds}
          userId={userId}
          propertyId={propertyId}
        />
      </Panel>
    </div>
  );
}
