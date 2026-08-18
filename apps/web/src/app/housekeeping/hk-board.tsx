'use client';

import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { useMarkRoomClean } from '@/hooks/use-housekeeping';
import type { HkBoardRoom, HkStage } from '@/lib/api/housekeeping';

const STAGES: HkStage[] = ['DIRTY', 'CLEAN', 'READY'];
const buttonClass = 'min-h-11 w-full';

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
  const markClean = useMarkRoomClean();

  async function clean(roomId: string) {
    try {
      await markClean.mutateAsync(roomId);
      toast.success(t('housekeeping.cleanSuccess'));
    } catch {
      toast.error(t('housekeeping.cleanFailed'));
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
                        {room.number} · {room.roomType?.name ?? room.status}
                      </button>
                      {stage === 'DIRTY' ? (
                        <Button
                          type="button"
                          className={buttonClass}
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
