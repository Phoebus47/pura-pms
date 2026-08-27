import { render, screen } from '@testing-library/react';
import { RoomLockBadge, roomLockTone } from './room-lock-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';

describe('RoomLockBadge', () => {
  const label = t('reservations.roomLock.badge');

  it('renders nothing when the room is not locked', () => {
    const { container } = render(<RoomLockBadge isRoomLocked={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the room-lock label with the info tone', () => {
    render(<RoomLockBadge isRoomLocked />);

    expect(screen.getByText(label)).toHaveClass(
      ...statusToneClass[roomLockTone].split(' '),
    );
  });

  it('applies a custom className', () => {
    render(<RoomLockBadge isRoomLocked className="custom-class" />);

    expect(screen.getByText(label)).toHaveClass('custom-class');
  });
});
