'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users, Search } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GuestFormDialog } from '@/components/guest-form-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { PageHeader } from '@/components/shared/page-header';
import { Panel } from '@/components/shared/panel';
import { Toolbar } from '@/components/shared/toolbar';
import { useGuests } from '@/hooks/use-guests';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { statusToneInk, statusToneSurface } from '@/lib/design/status-tone';
import { cn } from '@/lib/utils';
import { formatMessage, t } from '@/lib/i18n';
import { GuestTable } from './guest-table';

export function GuestsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q')?.trim() ?? '';
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const { guests, loading, error, loadGuests, deleteGuest } = useGuests({
    search: searchQuery,
    limit: 50,
  });
  const { confirm, Dialog } = useConfirmDialog();

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  function handleSearch() {
    loadGuests();
  }

  function handleCreate() {
    setSelectedGuest(null);
    setIsFormOpen(true);
  }

  function handleEdit(e: React.MouseEvent, guest: Guest) {
    e.stopPropagation();
    setSelectedGuest(guest);
    setIsFormOpen(true);
  }

  function handleDelete(e: React.MouseEvent, guest: Guest) {
    e.stopPropagation();
    confirm(
      t('common.deleteGuest'),
      formatMessage('common.deleteGuestNamedConfirm', {
        name: `${guest.firstName} ${guest.lastName}`,
      }),
      async () => {
        await deleteGuest(guest.id);
      },
    );
  }

  function handleFormSuccess() {
    loadGuests();
  }

  if (loading) {
    return <LoadingSpinner message={t('common.loadingGuests')} />;
  }

  if (error) {
    return (
      <Panel className={cn('border', statusToneSurface.critical)}>
        <h2 className={cn('font-semibold text-lg', statusToneInk.critical)}>
          {t('common.errorLoadingGuest')}
        </h2>
        <p className={cn('mt-2 text-sm', statusToneInk.critical)}>{error}</p>
        <Button onClick={loadGuests} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </Panel>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        <PageHeader
          title={t('guests.list.title')}
          subtitle={t('guests.list.subtitle')}
          actions={
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              {t('common.addGuest')}
            </Button>
          }
        />

        <Toolbar
          search={
            <div className="relative">
              <Search
                className="-translate-y-1/2 absolute h-4 left-3.5 text-ink-disabled top-1/2 w-4"
                aria-hidden="true"
              />
              <Input
                id="guest-search"
                name="guestSearch"
                type="search"
                aria-label={t('common.searchGuestsPlaceholder')}
                placeholder={t('common.searchGuestsPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          }
          actions={<Button onClick={handleSearch}>{t('common.search')}</Button>}
        />

        <Panel padding="none" className="overflow-hidden">
          {guests.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={t('common.noGuestsFound')}
              description={
                searchQuery
                  ? t('common.tryDifferentSearch')
                  : t('common.addFirstGuest')
              }
            />
          ) : (
            <GuestTable
              guests={guests}
              onSelect={(guest) => router.push(`/guests/${guest.id}`)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </Panel>
      </div>

      <GuestFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        guest={selectedGuest}
      />
    </>
  );
}
