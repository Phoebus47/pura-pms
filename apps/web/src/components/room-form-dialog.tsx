"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  roomsAPI,
  roomTypesAPI,
  type Room,
  type CreateRoomDto,
  type RoomType,
  type RoomStatus,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "./property-selector";

interface RoomFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  room?: Room | null;
}

const ROOM_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: "VACANT_CLEAN", label: "Vacant Clean" },
  { value: "VACANT_DIRTY", label: "Vacant Dirty" },
  { value: "OCCUPIED_CLEAN", label: "Occupied Clean" },
  { value: "OCCUPIED_DIRTY", label: "Occupied Dirty" },
  { value: "OUT_OF_ORDER", label: "Out of Order" },
  { value: "OUT_OF_SERVICE", label: "Out of Service" },
];

export function RoomFormDialog({
  isOpen,
  onClose,
  onSuccess,
  room,
}: RoomFormDialogProps) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    number: "",
    floor: 1,
    status: "VACANT_CLEAN",
    roomTypeId: "",
    propertyId: "",
  });
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (room) {
      setFormData({
        number: room.number,
        floor: room.floor || 1,
        status: room.status,
        roomTypeId: room.roomTypeId,
        propertyId: room.propertyId,
      });
    } else {
      setFormData({
        number: "",
        floor: 1,
        status: "VACANT_CLEAN",
        roomTypeId: "",
        propertyId: "",
      });
    }
    setError(null);
  }, [room, isOpen]);

  useEffect(() => {
    if (formData.propertyId) {
      loadRoomTypes(formData.propertyId);
    } else {
      setRoomTypes([]);
    }
  }, [formData.propertyId]);

  async function loadRoomTypes(propertyId: string) {
    try {
      setLoadingRoomTypes(true);
      const data = await roomTypesAPI.getAll(propertyId);
      setRoomTypes(data);
    } catch (error) {
      console.error("Failed to load room types:", error);
    } finally {
      setLoadingRoomTypes(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (room) {
        await roomsAPI.update(room.id, formData);
      } else {
        await roomsAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save room");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1e4b8e]">
            {room ? "Edit Room" : "New Room"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          <div className="space-y-4">
            {/* Property */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Property *
              </label>
              <PropertySelector
                value={formData.propertyId}
                onChange={(propertyId) =>
                  setFormData({ ...formData, propertyId, roomTypeId: "" })
                }
                required
              />
            </div>

            {/* Room Number & Floor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  required
                  placeholder="101"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Floor
                </label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      floor: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  placeholder="1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room Type *
              </label>
              <select
                value={formData.roomTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, roomTypeId: e.target.value })
                }
                required
                disabled={!formData.propertyId || loadingRoomTypes}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all appearance-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {loadingRoomTypes
                    ? "Loading..."
                    : formData.propertyId
                      ? "Select a room type"
                      : "Select property first"}
                </option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} - ฿{Number(type.baseRate).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as RoomStatus,
                  })
                }
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all appearance-none bg-white"
              >
                {ROOM_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e]"
              disabled={loading}
            >
              {loading ? "Saving..." : room ? "Update Room" : "Create Room"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
