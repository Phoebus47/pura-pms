import { fireEvent, render, screen } from '@testing-library/react';
import { RoomLockFields } from './room-lock-fields';
import { t } from '@/lib/i18n';

describe('RoomLockFields', () => {
  it('toggles the room lock checkbox', () => {
    const onChange = vi.fn();
    render(
      <RoomLockFields
        isRoomLocked={false}
        onIsRoomLockedChange={onChange}
        roomLockNote=""
        onRoomLockNoteChange={vi.fn()}
      />,
    );

    fireEvent.click(
      screen.getByRole('checkbox', { name: /lock this room assignment/i }),
    );
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows the lock note field on confirm', () => {
    render(
      <RoomLockFields
        isRoomLocked
        onIsRoomLockedChange={vi.fn()}
        roomLockNote=""
        onRoomLockNoteChange={vi.fn()}
        showNote
      />,
    );

    expect(
      screen.getByLabelText(`${t('reservations.roomLock.note')} *`),
    ).toBeInTheDocument();
  });
});
