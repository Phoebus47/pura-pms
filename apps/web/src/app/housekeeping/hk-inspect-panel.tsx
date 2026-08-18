'use client';

import { useState } from 'react';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { useHkChecklist, useInspectRoom } from '@/hooks/use-housekeeping';
import type { HkBoardRoom, HkChecklistItem } from '@/lib/api/housekeeping';

const buttonClass = 'min-h-11 w-full sm:w-auto';
const EMPTY_CHECKLIST: HkChecklistItem[] = [];

export function HkInspectPanel({ room }: { readonly room: HkBoardRoom }) {
  const userId = useAuthStore((state) => state.user?.id) ?? 'usr_mock_1';
  const { data: checklist = EMPTY_CHECKLIST } = useHkChecklist();
  const inspect = useInspectRoom();
  const [passed, setPassed] = useState<Record<string, boolean>>({});

  if (room.hkStage !== 'CLEAN') {
    return (
      <p className="text-slate-600 text-sm">{t('housekeeping.inspectHint')}</p>
    );
  }

  async function submit() {
    try {
      await inspect.mutateAsync({
        roomId: room.id,
        inspectedBy: userId,
        lines: checklist.map((item) => ({
          itemCode: item.code,
          passed: passed[item.code] !== false,
        })),
      });
      toast.success(t('housekeeping.inspectSuccess'));
    } catch {
      toast.error(t('housekeeping.inspectFailed'));
    }
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      {checklist.map((item) => {
        const id = `hk-${item.code}`;
        return (
          <div key={item.code} className="flex gap-3 items-center min-h-11">
            <input
              id={id}
              name={item.code}
              type="checkbox"
              className="h-5 w-5"
              checked={passed[item.code] !== false}
              onChange={(event) =>
                setPassed((current) => ({
                  ...current,
                  [item.code]: event.target.checked,
                }))
              }
            />
            <Label htmlFor={id}>
              {t(`housekeeping.items.${item.code}`)}
              {item.required ? ` (${t('housekeeping.required')})` : ''}
            </Label>
          </div>
        );
      })}
      <Button
        type="submit"
        className={buttonClass}
        disabled={checklist.length === 0}
      >
        {t('housekeeping.inspectSubmit')}
      </Button>
    </form>
  );
}
