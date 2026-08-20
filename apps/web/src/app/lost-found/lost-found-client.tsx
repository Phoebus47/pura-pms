'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import {
  useClaimLostFoundItem,
  useCreateLostFoundItem,
  useDisposeLostFoundItem,
  useLostFoundItems,
  useReturnLostFoundItem,
} from '@/hooks/use-lost-found';
import { isLostFoundOverdue } from './lost-found-helpers';
import { LostFoundItemCard } from './lost-found-item-card';
import { LostFoundRegisterForm } from './lost-found-register-form';

export function LostFoundClient() {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertiesAPI.getAll(),
  });
  const propertyId = properties?.[0]?.id;
  const { data: items = [], isLoading } = useLostFoundItems({ propertyId });
  const createItem = useCreateLostFoundItem();
  const claimItem = useClaimLostFoundItem();
  const returnItem = useReturnLostFoundItem();
  const disposeItem = useDisposeLostFoundItem();
  const overdueCount = items.filter(isLostFoundOverdue).length;

  async function handleCreate(values: {
    itemDescription: string;
    locationFound: string;
    roomNumber?: string;
  }) {
    if (!propertyId) return;
    try {
      await createItem.mutateAsync({
        propertyId,
        foundBy: userId,
        ...values,
      });
      toast.success(t('lostFound.createSuccess'));
    } catch {
      toast.error(t('lostFound.createFailed'));
    }
  }

  return (
    <div className="max-w-4xl md:p-6 mx-auto p-4 space-y-6">
      <header>
        <h1 className="font-bold text-(--pura-blue) text-3xl">
          {t('lostFound.title')}
        </h1>
        <p className="mt-1 text-slate-600 text-sm">{t('lostFound.subtitle')}</p>
      </header>

      {overdueCount > 0 ? (
        <p className="font-medium text-amber-800 text-sm" role="status">
          {t('lostFound.overdueAlert').replace('{count}', String(overdueCount))}
        </p>
      ) : null}

      <LostFoundRegisterForm
        isPending={createItem.isPending}
        onSubmit={handleCreate}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('lostFound.list')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t('common.loading')}</p> : null}
          {!isLoading && items.length === 0 ? (
            <p className="text-slate-600 text-sm">{t('lostFound.empty')}</p>
          ) : null}
          <ul className="space-y-3">
            {items.map((row) => (
              <LostFoundItemCard
                key={row.id}
                item={row}
                userId={userId}
                onClaim={(id, claimedBy) =>
                  claimItem.mutateAsync({ id, claimedBy })
                }
                onReturn={(id, returnedTo) =>
                  returnItem.mutateAsync({ id, returnedTo })
                }
                onDispose={(id, disposedBy, disposeReason) =>
                  disposeItem.mutateAsync({ id, disposedBy, disposeReason })
                }
              />
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
