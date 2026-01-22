'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  roomsAPI,
  roomTypesAPI,
  type Room,
  type CreateRoomDto,
  type RoomType,
  type RoomStatus,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/toast';
import { PropertySelector } from './property-selector';

interface RoomFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  room?: Room | null;
}

const ROOM_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: 'VACANT_CLEAN', label: 'Vacant Clean' },
  { value: 'VACANT_DIRTY', label: 'Vacant Dirty' },
  { value: 'OCCUPIED_CLEAN', label: 'Occupied Clean' },
  { value: 'OCCUPIED_DIRTY', label: 'Occupied Dirty' },
  { value: 'OUT_OF_ORDER', label: 'Out of Order' },
  { value: 'OUT_OF_SERVICE', label: 'Out of Service' },
];

export function RoomFormDialog({
  isOpen,
  onClose,
  onSuccess,
  room,
}: RoomFormDialogProps) {
  const [formData, setFormData] = useState<CreateRoomDto>({
    number: '',
    floor: 1,
    status: 'VACANT_CLEAN',
    roomTypeId: '',
    propertyId: '',
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
        number: '',
        floor: 1,
        status: 'VACANT_CLEAN',
        roomTypeId: '',
        propertyId: '',
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
    } catch {
      toast.error('Failed to load room types');
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
      setError(err instanceof Error ? err.message : 'Failed to save room');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-h-[90vh] max-w-2xl overflow-hidden rounded-3xl shadow-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">
            {room ? 'Edit Room' : 'New Room'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-slate-100 p-2 rounded-xl transition-colors"
          >
            <X className="h-5 text-slate-600 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
        >
          <div className="space-y-4">
            {/* Property */}
            <div>
              <label
                htmlFor="room-property-select"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Property *
              </label>
              <PropertySelector
                id="room-property-select"
                value={formData.propertyId}
                onChange={(propertyId) =>
                  setFormData({ ...formData, propertyId, roomTypeId: '' })
                }
                required
              />
            </div>

            {/* Room Number & Floor */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label
                  htmlFor="room-number"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Room Number *
                </label>
                <input
                  id="room-number"
                  name="number"
                  type="text"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  required
                  placeholder="101"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="room-floor"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Floor
                </label>
                <input
                  id="room-floor"
                  name="floor"
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
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* Room Type */}
            <div>
              <label
                htmlFor="room-type"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Room Type *
              </label>
              <select
                id="room-type"
                name="roomTypeId"
                value={formData.roomTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, roomTypeId: e.target.value })
                }
                required
                disabled={!formData.propertyId || loadingRoomTypes}
                className="appearance-none bg-white border border-slate-300 disabled:bg-slate-50 disabled:text-slate-400 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
              >
                <option value="">
                  {loadingRoomTypes
                    ? 'Loading...'
                    : formData.propertyId
                      ? 'Select a room type'
                      : 'Select property first'}
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
              <label
                htmlFor="room-status"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Status *
              </label>
              <select
                id="room-status"
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as RoomStatus,
                  })
                }
                required
                className="appearance-none bg-white border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
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
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-slate-200 border-t flex gap-3 mt-6 pt-6">
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
              className="bg-[#1e4b8e] flex-1 hover:bg-[#153a6e] rounded-xl"
              disabled={loading}
            >
              {loading ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
