"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { roomTypesAPI, type RoomType } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRoomTypes();
  }, []);

  async function loadRoomTypes() {
    try {
      setLoading(true);
      setError(null);
      const data = await roomTypesAPI.getAll();
      setRoomTypes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load room types",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete room type "${name}"?`))
      return;

    try {
      await roomTypesAPI.delete(id);
      loadRoomTypes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete room type");
    }
  }

  const filteredRoomTypes = roomTypes.filter(
    (rt) =>
      rt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rt.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e4b8e] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading room types...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 border border-red-200">
        <h3 className="text-red-800 font-semibold">Error loading room types</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <Button onClick={loadRoomTypes} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1e4b8e]">Room Types</h1>
          <p className="text-slate-600 mt-1">
            Manage room type configurations and pricing
          </p>
        </div>
        <Button className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]">
          <Plus className="h-4 w-4 mr-2" />
          Add Room Type
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search room types by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <p className="text-sm font-semibold text-slate-600">Total Types</p>
          <p className="text-3xl font-bold text-[#1e4b8e] mt-2">
            {roomTypes.length}
          </p>
        </div>
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <p className="text-sm font-semibold text-slate-600">Avg Base Rate</p>
          <p className="text-3xl font-bold text-[#1e4b8e] mt-2">
            ฿
            {roomTypes.length > 0
              ? Math.round(
                  roomTypes.reduce((sum, rt) => sum + Number(rt.baseRate), 0) /
                    roomTypes.length,
                ).toLocaleString()
              : 0}
          </p>
        </div>
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl">
          <p className="text-sm font-semibold text-slate-600">Total Rooms</p>
          <p className="text-3xl font-bold text-[#1e4b8e] mt-2">
            {roomTypes.reduce((sum, rt) => sum + (rt._count?.rooms || 0), 0)}
          </p>
        </div>
      </div>

      {/* Room Types Grid */}
      {filteredRoomTypes.length === 0 ? (
        <div className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-12 shadow-xl text-center">
          <p className="text-slate-600">
            {searchTerm
              ? "No room types found matching your search"
              : "No room types yet. Create your first room type to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoomTypes.map((roomType) => (
            <div
              key={roomType.id}
              className="rounded-3xl border border-white/50 bg-white/40 backdrop-blur-2xl p-6 shadow-xl hover:shadow-2xl transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e4b8e]">
                    {roomType.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">
                    {roomType.code}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(roomType.id, roomType.name)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {roomType.description && (
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {roomType.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Base Rate</span>
                  <span className="text-lg font-bold text-[#1e4b8e]">
                    ฿{Number(roomType.baseRate).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Max Occupancy</span>
                  <span className="font-semibold text-slate-800">
                    {roomType.maxOccupancy} guests
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Rooms</span>
                  <span className="font-semibold text-slate-800">
                    {roomType._count?.rooms || 0}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {roomType.amenities && roomType.amenities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">
                    Amenities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {roomType.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-[#1e4b8e]/10 text-[#1e4b8e] ring-1 ring-inset ring-[#1e4b8e]/20"
                      >
                        {amenity}
                      </span>
                    ))}
                    {roomType.amenities.length > 3 && (
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600">
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
  );
}
