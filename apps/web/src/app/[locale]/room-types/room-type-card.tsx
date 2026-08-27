'use client';

import { Edit, Trash2 } from 'lucide-react';
import type { RoomType } from '@/lib/api';
import { Panel } from '@/components/shared/panel';
import { formatMessage, t } from '@/lib/i18n';

interface RoomTypeCardProps {
  readonly roomType: RoomType;
  readonly onDelete: (roomType: RoomType) => void;
}

const CHIP =
  'font-semibold inline-flex items-center px-2 py-1 rounded-full text-xs';
const ICON_BUTTON =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring p-2 rounded-lg transition-colors';

function DetailRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-subtle text-sm">{label}</span>
      {children}
    </div>
  );
}

export function RoomTypeCard({ roomType, onDelete }: RoomTypeCardProps) {
  const extraAmenities = (roomType.amenities?.length ?? 0) - 3;

  return (
    <Panel padding="lg" className="hover:border-rule-strong transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-ink-strong text-lg">
            {roomType.name}
          </h2>
          <p className="font-mono mt-1 text-ink-subtle text-sm">
            {roomType.code}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            className={`${ICON_BUTTON} hover:bg-surface-inset`}
            title={t('common.edit')}
            aria-label={formatMessage('roomTypes.editAria', {
              name: roomType.name,
            })}
          >
            <Edit className="h-4 text-ink-subtle w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(roomType)}
            className={`${ICON_BUTTON} hover:bg-status-critical-tint`}
            title={t('common.delete')}
            aria-label={formatMessage('roomTypes.deleteAria', {
              name: roomType.name,
            })}
          >
            <Trash2
              className="h-4 text-status-critical-ink w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {roomType.description && (
        <p className="line-clamp-2 mb-4 text-ink-subtle text-sm">
          {roomType.description}
        </p>
      )}

      <div className="mb-4 space-y-3">
        <DetailRow label={t('rooms.baseRate')}>
          <span className="font-bold tabular-nums text-lg text-pura-blue">
            ฿{Number(roomType.baseRate).toLocaleString()}
          </span>
        </DetailRow>
        <DetailRow label={t('rooms.maxOccupancy')}>
          <span className="font-semibold tabular-nums text-ink-strong">
            {formatMessage('rooms.guestsValue', {
              count: roomType.maxOccupancy,
            })}
          </span>
        </DetailRow>
        <DetailRow label={t('roomTypes.totalRooms')}>
          <span className="font-semibold tabular-nums text-ink-strong">
            {roomType._count?.rooms || 0}
          </span>
        </DetailRow>
      </div>

      {roomType.amenities && roomType.amenities.length > 0 && (
        <div>
          <p className="font-semibold mb-2 text-2xs text-ink-subtle tracking-wide uppercase">
            {t('rooms.amenities')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {roomType.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className={`${CHIP} bg-pura-blue/10 ring-1 ring-inset ring-pura-blue/20 text-pura-blue`}
              >
                {amenity}
              </span>
            ))}
            {extraAmenities > 0 && (
              <span className={`${CHIP} bg-surface-inset text-ink-subtle`}>
                {formatMessage('roomTypes.moreAmenities', {
                  count: extraAmenities,
                })}
              </span>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
