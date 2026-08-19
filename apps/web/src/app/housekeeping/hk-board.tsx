'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { useMarkRoomClean, useSetGuestRequest } from '@/hooks/use-housekeeping';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import type {
  GuestRoomRequest,
  HkBoardRoom,
  HkStage,
} from '@/lib/api/housekeeping';

const STAGES: HkStage[] = ['DIRTY', 'CLEAN', 'READY'];
const buttonClass = 'min-h-11 w-full';

function stageLabel(stage: HkStage) {
  if (stage === 'DIRTY') return t('housekeeping.stageDirty');
  if (stage === 'CLEAN') return t('housekeeping.stageClean');
  return t('housekeeping.stageReady');
}

function requestBadge(request: GuestRoomRequest | undefined) {
  if (request === 'DND') {
    return (
      <span className="font-medium text-amber-800 text-xs">
        {t('housekeeping.dnd')}
      </span>
    );
  }
  if (request === 'MUR') {
    return (
      <span className="font-medium text-sky-800 text-xs">
        {t('housekeeping.mur')}
      </span>
    );
  }
  return null;
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
          <section key={stage} className="space-y-2">
            <h2 className="font-semibold text-slate-800 text-sm">
              {stageLabel(stage)} ({column.length})
            </h2>
            {column.length === 0 ? (
              <p className="text-slate-600 text-sm">
                {t('housekeeping.empty')}
              </p>
            ) : (
              <ul className="space-y-2">
                {column.map((room) => (
                  <li key={room.id}>
                    <div className="border border-slate-200 p-3 rounded-md space-y-2">
                      <button
                        type="button"
                        className={`min-h-11 w-full rounded-md px-2 py-2 text-left text-sm ${
                          selectedId === room.id
                            ? 'bg-pura-blue/5 border border-pura-blue'
                            : 'border border-transparent'
                        }`}
                        onClick={() => onSelect(room.id)}
                      >
                        <span className="flex flex-wrap gap-2 items-center">
                          <span>
                            {room.number} · {room.roomType?.name ?? room.status}
                          </span>
                          {requestBadge(room.guestRequest)}
                        </span>
                      </button>
                      <div className="flex flex-wrap gap-2">
                        {room.guestRequest !== 'DND' ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={() => void setRequest(room.id, 'DND')}
                          >
                            {t('housekeeping.setDnd')}
                          </Button>
                        ) : null}
                        {room.guestRequest !== 'MUR' ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={() => void setRequest(room.id, 'MUR')}
                          >
                            {t('housekeeping.setMur')}
                          </Button>
                        ) : null}
                        {room.guestRequest && room.guestRequest !== 'NONE' ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="min-h-11"
                            onClick={() => void setRequest(room.id, 'NONE')}
                          >
                            {t('housekeeping.clearRequest')}
                          </Button>
                        ) : null}
                      </div>
                      {stage === 'DIRTY' ? (
                        <Button
                          type="button"
                          className={buttonClass}
                          disabled={room.guestRequest === 'DND'}
                          onClick={() => void clean(room.id)}
                        >
                          {t('housekeeping.markClean')}
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
