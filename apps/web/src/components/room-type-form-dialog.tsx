'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { roomTypesAPI, type RoomType, type CreateRoomTypeDto } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PropertySelector } from './property-selector';
import { BaseFormDialog } from '@/components/shared/base-form-dialog';
import {
  TextInput,
  NumberInput,
  Textarea,
} from '@/components/shared/form-fields';
import { FormDialogFooter } from '@/components/shared/form-dialog-footer';
import { ErrorDisplay } from '@/components/shared/error-display';

interface RoomTypeFormDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly roomType?: RoomType | null;
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

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={roomType ? 'Edit Room Type' : 'New Room Type'}
      maxWidth="xl"
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
      >
        <div className="space-y-4">
          {/* Property */}
          <div>
            <label
              htmlFor="room-type-property-select"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
              Property *
            </label>
            <PropertySelector
              id="room-type-property-select"
              value={formData.propertyId}
              onChange={(propertyId) =>
                setFormData({ ...formData, propertyId })
              }
              required
            />
          </div>

          {/* Name & Code */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="room-type-name"
              name="name"
              label="Room Type Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
              placeholder="Deluxe Suite"
            />
            <TextInput
              id="room-type-code"
              name="code"
              label="Code"
              value={formData.code}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  code: value.toUpperCase(),
                })
              }
              required
              placeholder="DLX"
              className="uppercase"
            />
          </div>

          {/* Description */}
          <Textarea
            id="room-type-description"
            name="description"
            label="Description"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder="Room type description..."
            rows={3}
          />

          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <NumberInput
              id="room-type-base-rate"
              name="baseRate"
              label="Base Rate (฿)"
              value={formData.baseRate}
              onChange={(value) =>
                setFormData({ ...formData, baseRate: value })
              }
              required
              min={0}
              step={0.01}
              placeholder="1500"
            />
            <NumberInput
              id="room-type-max-adults"
              name="maxAdults"
              label="Max Adults"
              value={formData.maxAdults}
              onChange={(value) =>
                setFormData({ ...formData, maxAdults: value })
              }
              required
              min={1}
              placeholder="2"
            />
            <NumberInput
              id="room-type-max-children"
              name="maxChildren"
              label="Max Children"
              value={formData.maxChildren}
              onChange={(value) =>
                setFormData({ ...formData, maxChildren: value })
              }
              required
              min={0}
              placeholder="1"
            />
          </div>

          {/* Amenities */}
          <div>
            <label
              htmlFor="room-type-amenity"
              className="block font-semibold mb-2 text-slate-700 text-sm"
            >
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder="e.g., WiFi, TV, Mini Bar"
                className="border border-slate-300 flex-1 focus:border-[#1e4b8e] focus:ring-[#1e4b8e]/10 focus:ring-4 outline-none px-4 py-3 rounded-xl transition-all"
              />
              <Button
                type="button"
                onClick={addAmenity}
                className="bg-[#1e4b8e] hover:bg-[#153a6e] px-4 rounded-xl"
                aria-label="Add amenity"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            {/* Amenities List */}
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <div
                    key={`${amenity}-${index}`}
                    className="bg-[#1e4b8e]/10 font-semibold gap-2 inline-flex items-center px-3 py-1.5 ring-[#1e4b8e]/20 ring-1 ring-inset rounded-full text-[#1e4b8e] text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(index)}
                      className="hover:text-red-600 transition-colors"
                      aria-label={`Remove ${amenity}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          <ErrorDisplay error={error} />
        </div>

        {/* Footer */}
        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={roomType ? 'Update Room Type' : 'Create Room Type'}
        />
      </form>
    </BaseFormDialog>
  );
}
