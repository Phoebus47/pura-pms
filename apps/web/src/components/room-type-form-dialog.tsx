'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { roomTypesAPI, type RoomType, type CreateRoomTypeDto } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertySelector } from './property-selector';

interface RoomTypeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomType?: RoomType | null;
}

export function RoomTypeFormDialog({
  isOpen,
  onClose,
  onSuccess,
  roomType,
}: RoomTypeFormDialogProps) {
  const [formData, setFormData] = useState<CreateRoomTypeDto>({
    name: '',
    code: '',
    description: '',
    baseRate: 0,
    maxAdults: 2,
    maxChildren: 1,
    amenities: [],
    propertyId: '',
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomType) {
      setFormData({
        name: roomType.name,
        code: roomType.code,
        description: roomType.description || '',
        baseRate: Number(roomType.baseRate),
        maxAdults: roomType.maxAdults,
        maxChildren: roomType.maxChildren,
        amenities: roomType.amenities || [],
        propertyId: roomType.propertyId,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        baseRate: 0,
        maxAdults: 2,
        maxChildren: 1,
        amenities: [],
        propertyId: '',
      });
    }
    setNewAmenity('');
    setError(null);
  }, [roomType, isOpen]);

  function addAmenity() {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), newAmenity.trim()],
      });
      setNewAmenity('');
    }
  }

  function removeAmenity(index: number) {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter((_, i) => i !== index) || [],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (roomType) {
        await roomTypesAPI.update(roomType.id, formData);
      } else {
        await roomTypesAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save room type');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="backdrop-blur-sm bg-black/50 fixed flex inset-0 items-center justify-center p-4 z-50">
      <div className="bg-white max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl shadow-2xl w-full">
        {/* Header */}
        <div className="border-b border-slate-200 flex items-center justify-between p-6">
          <h2 className="font-bold text-[#1e4b8e] text-2xl">
            {roomType ? 'Edit Room Type' : 'New Room Type'}
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
              <label className="block font-semibold mb-2 text-slate-700 text-sm">
                Property *
              </label>
              <PropertySelector
                value={formData.propertyId}
                onChange={(propertyId) =>
                  setFormData({ ...formData, propertyId })
                }
                required
              />
            </div>

            {/* Name & Code */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
              <div>
                <label
                  htmlFor="room-type-name"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Room Type Name *
                </label>
                <input
                  id="room-type-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Deluxe Suite"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="room-type-code"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Code *
                </label>
                <input
                  id="room-type-code"
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  placeholder="DLX"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all uppercase w-full"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="room-type-description"
                className="block font-semibold mb-2 text-slate-700 text-sm"
              >
                Description
              </label>
              <textarea
                id="room-type-description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Room type description..."
                rows={3}
                className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 resize-none rounded-xl transition-all w-full"
              />
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div>
                <label
                  htmlFor="room-type-base-rate"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Base Rate (฿) *
                </label>
                <input
                  id="room-type-base-rate"
                  name="baseRate"
                  type="number"
                  value={formData.baseRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                  min="0"
                  step="0.01"
                  placeholder="1500"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="room-type-max-adults"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Max Adults *
                </label>
                <input
                  id="room-type-max-adults"
                  name="maxAdults"
                  type="number"
                  value={formData.maxAdults}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxAdults: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                  min="1"
                  placeholder="2"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>

              <div>
                <label
                  htmlFor="room-type-max-children"
                  className="block font-semibold mb-2 text-slate-700 text-sm"
                >
                  Max Children *
                </label>
                <input
                  id="room-type-max-children"
                  name="maxChildren"
                  type="number"
                  value={formData.maxChildren}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxChildren: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min="0"
                  placeholder="1"
                  className="border border-slate-300 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all w-full"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block font-semibold mb-2 text-slate-700 text-sm">
                Amenities
              </label>

              {/* Add Amenity */}
              <div className="flex gap-2 mb-3">
                <input
                  id="room-type-amenity"
                  name="amenity"
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addAmenity())
                  }
                  placeholder="e.g., WiFi, TV, Mini Bar"
                  className="border border-slate-300 flex-1 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all"
                />
                <Button
                  type="button"
                  onClick={addAmenity}
                  className="bg-[#1e4b8e] hover:bg-[#153a6e] px-4 rounded-xl"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Amenities List */}
              {formData.amenities && formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="bg-[#1e4b8e]/10 font-semibold gap-2 inline-flex items-center px-3 py-1.5 ring-[#1e4b8e]/20 ring-1 ring-inset rounded-full text-[#1e4b8e] text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              {loading
                ? 'Saving...'
                : roomType
                  ? 'Update Room Type'
                  : 'Create Room Type'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
