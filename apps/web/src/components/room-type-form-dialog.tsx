'use client';

import { useState, useEffect } from 'react';
import { roomTypesAPI, type RoomType, type CreateRoomTypeDto } from '@/lib/api';
import { t } from '@/lib/i18n';
import { PropertySelector } from './property-selector';
import { RoomTypeAmenityField } from './room-type-amenity-field';
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
        amenities: [...(formData.amenities as string[]), newAmenity.trim()],
      });
      setNewAmenity('');
    }
  }

  function removeAmenity(index: number) {
    setFormData({
      ...formData,
      amenities: (formData.amenities as string[]).filter((_, i) => i !== index),
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
      setError(
        err instanceof Error ? err.message : t('roomTypes.form.saveFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={roomType ? t('roomTypes.form.edit') : t('roomTypes.form.new')}
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
              className="block font-semibold mb-2 text-foreground text-sm"
            >
              {t('rooms.form.propertyRequired')}
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
              label={t('roomTypes.form.name')}
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required
              placeholder={t('roomTypes.form.namePlaceholder')}
            />
            <TextInput
              id="room-type-code"
              name="code"
              label={t('common.code')}
              value={formData.code}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  code: value.toUpperCase(),
                })
              }
              required
              placeholder={t('roomTypes.form.codePlaceholder')}
              className="uppercase"
            />
          </div>

          {/* Description */}
          <Textarea
            id="room-type-description"
            name="description"
            label={t('common.description')}
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            placeholder={t('roomTypes.form.descriptionPlaceholder')}
            rows={3}
          />

          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            <NumberInput
              id="room-type-base-rate"
              name="baseRate"
              label={t('roomTypes.form.baseRate')}
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
              label={t('roomTypes.form.maxAdults')}
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
              label={t('roomTypes.form.maxChildren')}
              value={formData.maxChildren}
              onChange={(value) =>
                setFormData({ ...formData, maxChildren: value })
              }
              required
              min={0}
              placeholder="1"
            />
          </div>

          <RoomTypeAmenityField
            amenities={formData.amenities ?? []}
            newAmenity={newAmenity}
            onNewAmenityChange={setNewAmenity}
            onAdd={addAmenity}
            onRemove={removeAmenity}
          />

          <ErrorDisplay error={error} />
        </div>

        {/* Footer */}
        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={
            roomType ? t('roomTypes.form.update') : t('roomTypes.form.create')
          }
        />
      </form>
    </BaseFormDialog>
  );
}
