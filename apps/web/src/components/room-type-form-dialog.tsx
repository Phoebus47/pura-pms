"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { roomTypesAPI, type RoomType, type CreateRoomTypeDto } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PropertySelector } from "./property-selector";

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
    name: "",
    code: "",
    description: "",
    baseRate: 0,
    maxAdults: 2,
    maxChildren: 1,
    amenities: [],
    propertyId: "",
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomType) {
      setFormData({
        name: roomType.name,
        code: roomType.code,
        description: roomType.description || "",
        baseRate: Number(roomType.baseRate),
        maxAdults: roomType.maxAdults,
        maxChildren: roomType.maxChildren,
        amenities: roomType.amenities || [],
        propertyId: roomType.propertyId,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        baseRate: 0,
        maxAdults: 2,
        maxChildren: 1,
        amenities: [],
        propertyId: "",
      });
    }
    setNewAmenity("");
    setError(null);
  }, [roomType, isOpen]);

  function addAmenity() {
    if (newAmenity.trim() && !formData.amenities?.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), newAmenity.trim()],
      });
      setNewAmenity("");
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
      setError(err instanceof Error ? err.message : "Failed to save room type");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-[#1e4b8e]">
            {roomType ? "Edit Room Type" : "New Room Type"}
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
                  setFormData({ ...formData, propertyId })
                }
                required
              />
            </div>

            {/* Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Room Type Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Deluxe Suite"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Code *
                </label>
                <input
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all uppercase"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Room type description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all resize-none"
              />
            </div>

            {/* Base Rate & Occupancy */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Base Rate (฿) *
                </label>
                <input
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Adults *
                </label>
                <input
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Max Children *
                </label>
                <input
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amenities
              </label>

              {/* Add Amenity */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAmenity())
                  }
                  placeholder="e.g., WiFi, TV, Mini Bar"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e4b8e] focus:ring-4 focus:ring-[#1e4b8e]/10 outline-none transition-all"
                />
                <Button
                  type="button"
                  onClick={addAmenity}
                  className="rounded-xl bg-[#1e4b8e] hover:bg-[#153a6e] px-4"
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
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold bg-[#1e4b8e]/10 text-[#1e4b8e] ring-1 ring-inset ring-[#1e4b8e]/20"
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
              {loading
                ? "Saving..."
                : roomType
                  ? "Update Room Type"
                  : "Create Room Type"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
