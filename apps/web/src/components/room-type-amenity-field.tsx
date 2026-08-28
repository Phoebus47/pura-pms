'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMessage, t } from '@/lib/i18n';

interface RoomTypeAmenityFieldProps {
  readonly amenities: string[];
  readonly newAmenity: string;
  readonly onNewAmenityChange: (value: string) => void;
  readonly onAdd: () => void;
  readonly onRemove: (index: number) => void;
}

export function RoomTypeAmenityField({
  amenities,
  newAmenity,
  onNewAmenityChange,
  onAdd,
  onRemove,
}: RoomTypeAmenityFieldProps) {
  return (
    <div>
      <label
        htmlFor="room-type-amenity"
        className="block font-semibold mb-2 text-foreground text-sm"
      >
        {t('rooms.amenities')}
      </label>

      <div className="flex gap-2 mb-3">
        <input
          id="room-type-amenity"
          name="amenity"
          type="text"
          value={newAmenity}
          onChange={(e) => onNewAmenityChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={t('roomTypes.form.amenityPlaceholder')}
          className="border border-input flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 rounded-lg transition-colors"
        />
        <Button
          type="button"
          onClick={onAdd}
          className="px-4"
          aria-label={t('roomTypes.form.addAmenity')}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <div
              key={`${amenity}-${index}`}
              className="bg-pura-blue/10 font-semibold gap-2 inline-flex items-center px-3 py-1.5 ring-1 ring-inset ring-pura-blue/20 rounded-full text-pura-blue text-sm"
            >
              {amenity}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="hover:text-status-critical-ink transition-colors"
                aria-label={formatMessage('roomTypes.form.removeAmenity', {
                  name: amenity,
                })}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
