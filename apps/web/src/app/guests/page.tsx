"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Search, Star, Ban } from "lucide-react";
import { guestsAPI, type Guest } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    try {
      setLoading(true);
      setError(null);
      const response = await guestsAPI.getAll({
        search: searchQuery || undefined,
        limit: 50,
      });
      setGuests(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load guests");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadGuests();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading guests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading guests</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button onClick={loadGuests} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e4b8e]">Guests</h1>
          <p className="text-slate-600 mt-1">
            Manage guest profiles and history
          </p>
        </div>
        <Button className="bg-[#1e4b8e] hover:bg-[#153a6e]">
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:border-[#1e4b8e]/40 focus:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#1e4b8e]/10 placeholder:text-slate-500 shadow-lg"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Guests List */}
      {guests.length === 0 ? (
        <div className="text-center py-12 bg-white/40 backdrop-blur-2xl rounded-3xl border border-white/50">
          <Users className="h-16 w-16 text-slate-300 mx-auto" />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No guests found
          </h3>
          <p className="text-slate-500 mt-2">
            {searchQuery
              ? "Try a different search term"
              : "Get started by adding your first guest"}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    VIP Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Stays
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {guests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="hover:bg-white/50 transition-colors cursor-pointer"
                    onClick={() => {
                      window.location.href = `/guests/${guest.id}`;
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#1e4b8e]/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-[#1e4b8e]">
                            {guest.firstName[0]}
                            {guest.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {guest.firstName} {guest.lastName}
                          </div>
                          {guest.nationality && (
                            <div className="text-xs text-slate-500">
                              {guest.nationality}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {guest.email || "-"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {guest.phone || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: guest.vipLevel }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-[#f5a623] text-[#f5a623]"
                          />
                        ))}
                        {guest.vipLevel === 0 && (
                          <span className="text-xs text-slate-400">
                            Standard
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">
                        {guest.totalStays}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-[#1e4b8e]">
                        ฿{Number(guest.totalRevenue).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {guest.isBlacklist ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-700 ring-1 ring-inset ring-red-600/20">
                          <Ban className="h-3 w-3" />
                          Blacklisted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
