import { t } from '@/lib/i18n';

interface RoomLockFieldsProps {
  readonly isRoomLocked: boolean;
  readonly onIsRoomLockedChange: (value: boolean) => void;
  readonly roomLockNote: string;
  readonly onRoomLockNoteChange: (value: string) => void;
  readonly showNote?: boolean;
  readonly disabled?: boolean;
}

export function RoomLockFields({
  isRoomLocked,
  onIsRoomLockedChange,
  roomLockNote,
  onRoomLockNoteChange,
  showNote = false,
  disabled = false,
}: RoomLockFieldsProps) {
  if (showNote && !isRoomLocked) {
    return null;
  }

  if (showNote) {
    return (
      <div>
        <label
          htmlFor="room-lock-note"
          className="block font-semibold mb-2 text-foreground text-sm"
        >
          {t('reservations.roomLock.note')} *
        </label>
        <input
          id="room-lock-note"
          name="roomLockNote"
          value={roomLockNote}
          onChange={(event) => onRoomLockNoteChange(event.target.value)}
          className="border border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring px-4 py-3 rounded-xl transition-all w-full"
          required
        />
      </div>
    );
  }

  return (
    <label className="cursor-pointer flex gap-3 items-start min-h-11">
      <input
        id="room-lock"
        name="isRoomLocked"
        type="checkbox"
        checked={isRoomLocked}
        disabled={disabled}
        onChange={(event) => onIsRoomLockedChange(event.target.checked)}
        className="border-input disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring h-4 mt-1 rounded text-pura-blue w-4"
      />
      <span>
        <span className="block font-semibold text-foreground text-sm">
          {t('reservations.roomLock.checkbox')}
        </span>
        <span className="block mt-1 text-muted-foreground text-xs">
          {t('reservations.roomLock.hint')}
        </span>
      </span>
    </label>
  );
}
