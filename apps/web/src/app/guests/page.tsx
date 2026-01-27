'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, Search, Star, Ban, Pencil, Trash2 } from 'lucide-react';
import { type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GuestFormDialog } from '@/components/guest-form-dialog';
import { useGuests } from '@/hooks/use-guests';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

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
      'Delete Guest',
      `Are you sure you want to delete "${name}"? This action cannot be undone.`,
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
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">Error loading guests</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadGuests} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      {Dialog}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[#1e4b8e] text-3xl">Guests</h1>
            <p className="mt-1 text-slate-600">
              Manage guest profiles and history
            </p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
          >
            <Plus className="h-4 mr-2 w-4" />
            Add Guest
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 max-w-md relative">
            <Search className="-translate-y-1/2 absolute h-4 left-3.5 text-slate-400 top-1/2 w-4" />
            <input
              type="search"
              placeholder="Search by name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="backdrop-blur-xl bg-white/60 border border-white/60 focus:bg-white/80 focus:border-[#1e4b8e]/40 focus:outline-none focus:ring-[#1e4b8e]/10 focus:ring-4 pl-10 placeholder:text-slate-500 pr-4 py-2.5 rounded-2xl shadow-lg text-sm transition-all w-full"
            />
          </div>
          <Button onClick={handleSearch} className="rounded-xl">
            Search
          </Button>
        </div>

        {/* Guests List */}
        {guests.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 py-12 rounded-3xl text-center">
            <Users className="h-16 mx-auto text-slate-300 w-16" />
            <h3 className="font-semibold mt-4 text-lg text-slate-700">
              No guests found
            </h3>
            <p className="mt-2 text-slate-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Get started by adding your first guest'}
            </p>
          </div>
        ) : (
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 overflow-hidden rounded-3xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-200">
                  <tr>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Guest
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Contact
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      VIP Level
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Stays
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Revenue
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Status
                    </th>
                    <th className="font-semibold px-6 py-4 text-left text-slate-600 text-xs tracking-wider uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-slate-200 divide-y">
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="cursor-pointer hover:bg-white/50 transition-colors"
                      onClick={() => {
                        router.push(`/guests/${guest.id}`);
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex gap-3 items-center">
                          <div className="bg-[#1e4b8e]/10 flex h-10 items-center justify-center rounded-full w-10">
                            <span className="font-semibold text-[#1e4b8e] text-sm">
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
                                className="fill-[#f5a623] h-4 text-[#f5a623] w-4"
                              />
                            ),
                          )}
                          {guest.vipLevel === 0 && (
                            <span className="text-slate-400 text-xs">
                              Standard
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
                        <div className="font-semibold text-[#1e4b8e] text-sm">
                          ฿{Number(guest.totalRevenue).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {guest.isBlacklist ? (
                          <span className="bg-red-100 font-semibold gap-1 inline-flex items-center px-2.5 py-1 ring-1 ring-inset ring-red-600/20 rounded-full text-red-700 text-xs">
                            <Ban className="h-3 w-3" />
                            Blacklisted
                          </span>
                        ) : (
                          <span className="bg-emerald-100 font-semibold inline-flex items-center px-2.5 py-1 ring-1 ring-emerald-600/20 ring-inset rounded-full text-emerald-700 text-xs">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                            onClick={(e) => handleEdit(e, guest)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-50 hover:text-red-600 rounded-xl"
                            onClick={(e) =>
                              handleDelete(
                                e,
                                guest.id,
                                `${guest.firstName} ${guest.lastName}`,
                              )
                            }
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

      {/* Guest Form Dialog */}
      <GuestFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        guest={selectedGuest}
      />
    </>
  );
}
