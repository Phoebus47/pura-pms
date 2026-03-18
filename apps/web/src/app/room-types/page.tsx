'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRoomTypes } from '@/hooks/use-room-types';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

export default function RoomTypesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { roomTypes, loading, error, loadRoomTypes, deleteRoomType } =
    useRoomTypes();
  const { confirm, Dialog } = useConfirmDialog();

  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  function handleDelete(id: string, name: string) {
    confirm(
      'Delete Room Type',
      `Are you sure you want to delete room type "${name}"? This action cannot be undone.`,
      async () => {
        await deleteRoomType(id);
      },
    );
  }

  const filteredRoomTypes = roomTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rt.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin border-[#1e4b8e] border-b-2 h-12 mx-auto rounded-full w-12"></div>
          <p className="mt-4 text-slate-600">Loading room types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
        <h3 className="font-semibold text-red-800">Error loading room types</h3>
        <p className="mt-2 text-red-600">{error}</p>
        <Button onClick={loadRoomTypes} className="mt-4">
          Retry
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
            <h1 className="font-bold text-[#1e4b8e] text-3xl">Room Types</h1>
            <p className="mt-1 text-slate-600">
              Manage room type configurations and pricing
            </p>
          </div>
          <Button className="bg-[#1e4b8e] hover:bg-[#153a6e] rounded-xl">
            <Plus className="h-4 mr-2 w-4" />
            Add Room Type
          </Button>
        </div>

        {/* Search */}
        <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
          <div className="relative">
            <Search className="-translate-y-1/2 absolute h-5 left-4 text-slate-400 top-1/2 w-5" />
            <Input
              type="search"
              placeholder="Search room types by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-12 pl-12 pr-4 py-3 rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
            <p className="font-semibold text-slate-600 text-sm">Total Types</p>
            <p className="font-bold mt-2 text-[#1e4b8e] text-3xl">
              {roomTypes.length}
            </p>
          </div>
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
            <p className="font-semibold text-slate-600 text-sm">
              Avg Base Rate
            </p>
            <p className="font-bold mt-2 text-[#1e4b8e] text-3xl">
              ฿
              {roomTypes.length > 0
                ? Math.round(
                    roomTypes.reduce(
                      (sum, rt) => sum + Number(rt.baseRate),
                      0,
                    ) / roomTypes.length,
                  ).toLocaleString()
                : 0}
            </p>
          </div>
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-6 rounded-3xl shadow-xl">
            <p className="font-semibold text-slate-600 text-sm">Total Rooms</p>
            <p className="font-bold mt-2 text-[#1e4b8e] text-3xl">
              {roomTypes.reduce((sum, rt) => sum + (rt._count?.rooms || 0), 0)}
            </p>
          </div>
        </div>

        {/* Room Types Grid */}
        {filteredRoomTypes.length === 0 ? (
          <div className="backdrop-blur-2xl bg-white/40 border border-white/50 p-12 rounded-3xl shadow-xl text-center">
            <p className="text-slate-600">
              {searchTerm
                ? 'No room types found matching your search'
                : 'No room types yet. Create your first room type to get started.'}
            </p>
          </div>
        ) : (
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
            {filteredRoomTypes.map((roomType) => (
              <div
                key={roomType.id}
                className="backdrop-blur-2xl bg-white/40 border border-white/50 group hover:shadow-2xl p-6 rounded-3xl shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1e4b8e] text-xl">
                      {roomType.name}
                    </h3>
                    <p className="font-mono mt-1 text-slate-500 text-sm">
                      {roomType.code}
                    </p>
                  </div>
                  <div className="flex gap-2 group-hover:opacity-100 opacity-0 transition-opacity">
                    <button
                      className="hover:bg-slate-100 p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 text-slate-600 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(roomType.id, roomType.name)}
                      className="hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 text-red-600 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {roomType.description && (
                  <p className="line-clamp-2 mb-4 text-slate-600 text-sm">
                    {roomType.description}
                  </p>
                )}

                {/* Details */}
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Base Rate</span>
                    <span className="font-bold text-[#1e4b8e] text-lg">
                      ฿{Number(roomType.baseRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">
                      Max Occupancy
                    </span>
                    <span className="font-semibold text-slate-800">
                      {roomType.maxOccupancy} guests
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Total Rooms</span>
                    <span className="font-semibold text-slate-800">
                      {roomType._count?.rooms || 0}
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                {roomType.amenities && roomType.amenities.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-slate-600 text-xs">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {roomType.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="bg-[#1e4b8e]/10 font-semibold inline-flex items-center px-2 py-1 ring-[#1e4b8e]/20 ring-1 ring-inset rounded-full text-[#1e4b8e] text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                      {roomType.amenities.length > 3 && (
                        <span className="bg-slate-100 font-semibold inline-flex items-center px-2 py-1 rounded-full text-slate-600 text-xs">
                          +{roomType.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
