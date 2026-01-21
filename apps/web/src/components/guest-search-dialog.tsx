'use client';

import { useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { guestsAPI, type Guest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';

interface GuestSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuest: (guest: Guest) => void;
  onCreateNew: () => void;
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
      toast.error('Failed to search guests');
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
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-h-[80vh] max-w-2xl overflow-hidden rounded-3xl shadow-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">Search Guest</h2>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="h-5 text-slate-600 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="-translate-y-1/2 absolute h-5 left-3 text-slate-400 top-1/2 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, email, or phone..."
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none pl-10 pr-4 py-3 rounded-xl transition-all w-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="bg-[#1e4b8e] hover:bg-[#153a6e] px-6 rounded-xl"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-6">
          {!searched ? (
            <div className="py-12 text-center">
              <Search className="h-12 mb-4 mx-auto text-slate-300 w-12" />
              <p className="text-slate-500">
                Enter a name, email, or phone to search
              </p>
            </div>
          ) : guests.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-slate-600">No guests found</p>
              <Button
                onClick={handleCreateNew}
                className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl"
              >
                <UserPlus className="h-4 mr-2 w-4" />
                Create New Guest
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {guests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleSelect(guest)}
                  className="border border-slate-200 hover:bg-[#1e4b8e]/5 hover:border-[#1e4b8e] p-4 rounded-2xl text-left transition-all w-full"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="mt-1 text-slate-500 text-sm">
                        {guest.email || guest.phone || 'No contact info'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-600 text-sm">
                        {guest.totalStays} stays
                      </p>
                      <p className="text-slate-500 text-xs">
                        ฿{Number(guest.totalRevenue).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {searched && guests.length > 0 && (
          <div className="border-slate-200 border-t p-6">
            <Button
              onClick={handleCreateNew}
              variant="outline"
              className="rounded-xl w-full"
            >
              <UserPlus className="h-4 mr-2 w-4" />
              Create New Guest Instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
