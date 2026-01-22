'use client';

import { useState, useEffect } from 'react';
import {
  roomsAPI,
  roomTypesAPI,
  type Room,
  type CreateRoomDto,
  type RoomType,
  type RoomStatus,
} from '@/lib/api';
import { toast } from '@/lib/toast';
import { PropertySelector } from './property-selector';
import { BaseFormDialog } from '@/components/shared/base-form-dialog';
import {
  TextInput,
  NumberInput,
  Select,
} from '@/components/shared/form-fields';
import { FormDialogFooter } from '@/components/shared/form-dialog-footer';
import { ErrorDisplay } from '@/components/shared/error-display';

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

  return (
    <BaseFormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={room ? 'Edit Room' : 'New Room'}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[calc(90vh-140px)] overflow-y-auto p-6"
      >
        <div className="space-y-4">
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

          <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
            <TextInput
              id="room-number"
              name="number"
              label="Room Number"
              value={formData.number}
              onChange={(value) => setFormData({ ...formData, number: value })}
              required
              placeholder="101"
            />
            <NumberInput
              id="room-floor"
              name="floor"
              label="Floor"
              value={formData.floor}
              onChange={(value) => setFormData({ ...formData, floor: value })}
              min={1}
              placeholder="1"
            />
          </div>

          <Select
            id="room-type"
            name="roomTypeId"
            label="Room Type"
            value={formData.roomTypeId}
            onChange={(value) =>
              setFormData({ ...formData, roomTypeId: value })
            }
            required
            disabled={!formData.propertyId || loadingRoomTypes}
            placeholder={
              loadingRoomTypes
                ? 'Loading...'
                : formData.propertyId
                  ? 'Select a room type'
                  : 'Select property first'
            }
            options={roomTypes.map((type) => ({
              value: type.id,
              label: `${type.name} - ฿${Number(type.baseRate).toLocaleString()}`,
            }))}
          />

          <Select
            id="room-status"
            name="status"
            label="Status"
            value={formData.status}
            onChange={(value) =>
              setFormData({
                ...formData,
                status: value as RoomStatus,
              })
            }
            required
            options={ROOM_STATUSES.map((status) => ({
              value: status.value,
              label: status.label,
            }))}
          />

          <ErrorDisplay error={error} />
        </div>

        <FormDialogFooter
          onCancel={onClose}
          loading={loading}
          submitLabel={room ? 'Update Room' : 'Create Room'}
        />
      </form>
    </BaseFormDialog>
  );
}
