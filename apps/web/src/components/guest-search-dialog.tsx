'use client';

import { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { guestsAPI, type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { formatMessage, t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

interface GuestSearchDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelectGuest: (guest: Guest) => void;
  readonly onCreateNew: () => void;
}

export function GuestSearchDialog({
  isOpen,
  onClose,
  onSelectGuest,
  onCreateNew,
}: GuestSearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const results = await guestsAPI.getAll({ search: searchTerm });
      setGuests(results.data);
      setSearched(true);
    } catch {
      toast.error(t('guests.search.searchFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(guest: Guest) {
    onSelectGuest(guest);
    onClose();
    setSearchTerm('');
    setGuests([]);
    setSearched(false);
  }

  function handleCreateNew() {
    onCreateNew();
    onClose();
    setSearchTerm('');
    setGuests([]);
    setSearched(false);
  }

  if (!isOpen) return null;

  return (
    <div className="bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-surface-desk max-h-[80vh] max-w-2xl overflow-hidden rounded-xl shadow-lg w-full">
        <div className="border-b border-rule-mist flex items-center justify-between p-6">
          <h2 className="font-bold text-2xl text-pura-blue">
            {getDialogTitle(searched, guests.length > 0)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.closeDialog')}
            className="hover:bg-muted p-2 rounded-lg transition-colors"
          >
            <X className="h-5 text-muted-foreground w-5" />
          </button>
        </div>

        <div className="border-b border-rule-mist p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="-translate-y-1/2 absolute h-5 left-3 text-muted-foreground top-1/2 w-5" />
              <input
                id="guest-search"
                name="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t('guests.search.placeholder')}
                className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring pl-10 pr-4 py-3 rounded-lg transition-colors w-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="px-6"
            >
              {loading ? t('common.searching') : t('common.search')}
            </Button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto p-6">{renderResults()}</div>

        {searched && guests.length > 0 && (
          <div className="border-rule-mist border-t p-6">
            <Button
              onClick={handleCreateNew}
              variant="outline"
              className="w-full"
            >
              <UserPlus className="h-4 mr-2 w-4" />
              {t('guests.search.createInstead')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  function renderResults() {
    if (!searched) {
      return (
        <div className="py-12 text-center">
          <Search className="h-12 mb-4 mx-auto text-muted-foreground/40 w-12" />
          <p className="text-muted-foreground">{t('guests.search.hint')}</p>
        </div>
      );
    }

    if (guests.length === 0) {
      return (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {t('common.noGuestsFound')}
          </p>
          <Button onClick={handleCreateNew}>
            <UserPlus className="h-4 mr-2 w-4" />
            {t('guests.search.createNew')}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {guests.map((guest) => (
          <button
            key={guest.id}
            type="button"
            onClick={() => handleSelect(guest)}
            className="border border-rule-mist hover:bg-pura-blue/5 hover:border-pura-blue p-4 rounded-lg text-left transition-colors w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  {guest.firstName} {guest.lastName}
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  {guest.email || guest.phone || t('guests.search.noContact')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">
                  {formatMessage('guests.search.stays', {
                    count: guest.totalStays,
                  })}
                </p>
                <p className="text-muted-foreground text-xs">
                  ฿{Number(guest.totalRevenue).toLocaleString()}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }
}

function getDialogTitle(
  isSearchPerformed: boolean,
  hasResults: boolean,
): string {
  if (!isSearchPerformed) return t('guests.search.title');
  if (hasResults) return t('guests.search.selectTitle');
  return t('guests.search.emptyTitle');
}
