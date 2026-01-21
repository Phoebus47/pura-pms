"use client";

import { useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { guestsAPI, type Guest } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
  const [searchTerm, setSearchTerm] = useState("");
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
    } catch (error) {
      console.error("Failed to search guests:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(guest: Guest) {
    onSelectGuest(guest);
    onClose();
    setSearchTerm("");
    setGuests([]);
    setSearched(false);
  }

  function handleCreateNew() {
    onCreateNew();
    onClose();
    setSearchTerm("");
    setGuests([]);
    setSearched(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1e4b8e]">Search Guest</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e] px-6"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 overflow-y-auto max-h-96">
          {!searched ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Enter a name, email, or phone to search
              </p>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No guests found</p>
              <Button
                onClick={handleCreateNew}
                className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Guest
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {guests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => handleSelect(guest)}
                  className="w-full p-4 rounded-2xl border border-slate-200 hover:border-[#1e4b8e] hover:bg-[#1e4b8e]/5 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {guest.firstName} {guest.lastName}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {guest.email || guest.phone || "No contact info"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600">
                        {guest.totalStays} stays
                      </p>
                      <p className="text-xs text-slate-500">
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
          <div className="p-6 border-t border-slate-200">
            <Button
              onClick={handleCreateNew}
              variant="outline"
              className="w-full rounded-xl"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create New Guest Instead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
