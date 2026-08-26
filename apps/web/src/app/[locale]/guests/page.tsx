'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Search, Star, Ban, Pencil, Trash2 } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GuestFormDialog } from '@/components/guest-form-dialog';
import { useGuests } from '@/hooks/use-guests';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatMessage, t } from '@/lib/i18n';

export default function GuestsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const { guests, loading, error, loadGuests, deleteGuest } = useGuests({
    search: searchQuery,
    limit: 50,
  });
  const { confirm, Dialog } = useConfirmDialog();

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

  function handleDelete(e: React.MouseEvent, id: string, name: string) {
    e.stopPropagation();
    confirm(
      t('common.deleteGuest'),
      formatMessage('common.deleteGuestNamedConfirm', { name }),
      async () => {
        await deleteGuest(id);
      },
    );
  }

  function handleFormSuccess() {
    loadGuests();
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-b-2 border-pura-blue h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">{t('common.loadingGuests')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="font-semibold text-red-800">
          {t('common.errorLoadingGuest')}
        </h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadGuests} className="mt-4">
          {t('common.tryAgain')}
        </Button>
      </div>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-3xl text-pura-blue">
              {t('guests.list.title')}
            </h1>
            <p className="mt-1 text-slate-600">{t('guests.list.subtitle')}</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 mr-2 w-4" />
            {t('common.addGuest')}
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 max-w-md relative">
            <Search className="-translate-y-1/2 absolute h-4 left-3.5 text-slate-400 top-1/2 w-4" />
            <input
              type="search"
              placeholder={t('common.searchGuestsPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="bg-white border border-slate-200 focus:border-pura-blue/40 focus:outline-none focus:ring-4 focus:ring-pura-blue/10 pl-10 placeholder:text-slate-500 pr-4 py-2.5 rounded-lg text-sm transition-colors w-full"
            />
          </div>
          <Button onClick={handleSearch}>{t('common.search')}</Button>
        </div>

        {guests.length === 0 ? (
          <div className="bg-white border border-slate-200 py-12 rounded-xl text-center">
            <Users className="h-16 mx-auto text-slate-300 w-16" />
            <h3 className="font-semibold mt-4 text-lg text-slate-700">
              {t('common.noGuestsFound')}
            </h3>
            <p className="mt-2 text-slate-500">
              {searchQuery
                ? t('common.tryDifferentSearch')
                : t('common.addFirstGuest')}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 overflow-hidden rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-[48rem] w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.guest')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.contact')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.vipLevel')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.stays')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.revenue')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.status')}
                    </th>
                    <th className="font-semibold px-4 py-3 text-left text-slate-600 text-xs tracking-wider uppercase whitespace-nowrap">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-slate-200 divide-y">
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        router.push(`/guests/${guest.id}`);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex gap-3 items-center">
                          <div className="bg-pura-blue/10 flex h-10 items-center justify-center rounded-full w-10">
                            <span className="font-semibold text-pura-blue text-sm">
                              {guest.firstName[0]}
                              {guest.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {guest.firstName} {guest.lastName}
                            </div>
                            {guest.nationality && (
                              <div className="text-slate-500 text-xs">
                                {guest.nationality}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700 text-sm">
                          {guest.email || '-'}
                        </div>
                        <div className="text-slate-500 text-xs">
                          {guest.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 items-center">
                          {Array.from({ length: guest.vipLevel }).map(
                            (_, i) => (
                              <Star
                                key={`${guest.id}-star-${i}`}
                                className="fill-pura-orange h-4 text-pura-orange w-4"
                              />
                            ),
                          )}
                          {guest.vipLevel === 0 && (
                            <span className="text-slate-400 text-xs">
                              {t('common.standard')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-sm">
                          {guest.totalStays}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-pura-blue text-sm">
                          ฿{Number(guest.totalRevenue).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {guest.isBlacklist ? (
                          <span className="bg-red-100 font-semibold gap-1 inline-flex items-center px-2.5 py-1.5 ring-1 ring-inset ring-red-600/20 rounded-full text-red-700 text-xs whitespace-nowrap">
                            <Ban className="h-3 w-3" />
                            {t('common.blacklisted')}
                          </span>
                        ) : (
                          <span className="bg-emerald-100 font-semibold inline-flex items-center px-2.5 py-1.5 ring-1 ring-emerald-600/20 ring-inset rounded-full text-emerald-700 text-xs whitespace-nowrap">
                            {t('common.active')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={(e) => handleEdit(e, guest)}
                            aria-label={t('common.edit')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-red-600"
                            onClick={(e) =>
                              handleDelete(
                                e,
                                guest.id,
                                `${guest.firstName} ${guest.lastName}`,
                              )
                            }
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
