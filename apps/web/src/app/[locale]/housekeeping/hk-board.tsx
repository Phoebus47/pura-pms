'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { SectionHeading } from '@/components/shared/section-heading';
import { StatusBadge } from '@/components/shared/status-badge';
import { useMarkRoomClean, useSetGuestRequest } from '@/hooks/use-housekeeping';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import type {
  GuestRoomRequest,
  HkBoardRoom,
  HkStage,
} from '@/lib/api/housekeeping';
import { HkRoomCard } from './hk-room-card';
import { hkStageTone } from './hk-tone';

const STAGES: HkStage[] = ['DIRTY', 'CLEAN', 'READY'];

function stageLabel(stage: HkStage) {
  if (stage === 'DIRTY') return t('housekeeping.stageDirty');
  if (stage === 'CLEAN') return t('housekeeping.stageClean');
  return t('housekeeping.stageReady');
}

export function HkBoard({
  rooms,
  selectedId,
  onSelect,
}: {
  readonly rooms: HkBoardRoom[];
  readonly selectedId?: string;
  readonly onSelect: (id: string) => void;
}) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const markClean = useMarkRoomClean();
  const setGuestRequest = useSetGuestRequest();

  async function clean(roomId: string) {
    try {
      await markClean.mutateAsync(roomId);
      toast.success(t('housekeeping.cleanSuccess'));
    } catch {
      toast.error(t('housekeeping.cleanFailed'));
    }
  }

  async function setRequest(roomId: string, request: GuestRoomRequest) {
    try {
      await setGuestRequest.mutateAsync({
        roomId,
        request,
        updatedBy: userId,
      });
      toast.success(t('housekeeping.guestRequestSuccess'));
    } catch {
      toast.error(t('housekeeping.guestRequestFailed'));
    }
  }

  return (
    <div className="gap-4 grid md:grid-cols-3">
      {STAGES.map((stage) => {
        const column = rooms.filter((room) => room.hkStage === stage);
        return (
          <section key={stage} className="space-y-3">
            <SectionHeading
              title={stageLabel(stage)}
              actions={
                <StatusBadge
                  tone={hkStageTone(stage)}
                  label={String(column.length)}
                  size="sm"
                />
              }
            />
            {column.length === 0 ? (
              <p className="text-ink-subtle text-sm">
                {t('housekeeping.empty')}
              </p>
            ) : (
              <ul className="space-y-3">
                {column.map((room) => (
                  <HkRoomCard
                    key={room.id}
                    room={room}
                    isSelected={selectedId === room.id}
                    onSelect={onSelect}
                    onSetRequest={(id, request) => void setRequest(id, request)}
                    onMarkClean={
                      stage === 'DIRTY' ? (id) => void clean(id) : undefined
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
