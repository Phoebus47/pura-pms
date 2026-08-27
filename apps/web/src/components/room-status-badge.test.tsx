import { render, screen } from '@testing-library/react';
import { RoomStatusBadge, roomStatusTone } from './room-status-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import { t } from '@/lib/i18n';
import type { RoomStatus } from '@/lib/api/rooms';

describe('RoomStatusBadge', () => {
  const labels: Record<RoomStatus, string> = {
    VACANT_CLEAN: t('rooms.status.VACANT_CLEAN'),
    VACANT_DIRTY: t('rooms.status.VACANT_DIRTY'),
    OCCUPIED_CLEAN: t('rooms.status.OCCUPIED_CLEAN'),
    OCCUPIED_DIRTY: t('rooms.status.OCCUPIED_DIRTY'),
    OUT_OF_ORDER: t('rooms.status.OUT_OF_ORDER'),
    OUT_OF_SERVICE: t('rooms.status.OUT_OF_SERVICE'),
  };

  const statuses = Object.keys(labels) as RoomStatus[];

  it.each(statuses)('should render %s status correctly', (status) => {
    render(<RoomStatusBadge status={status} />);

    expect(screen.getByText(labels[status])).toBeInTheDocument();
  });

  it.each(statuses)('should apply the %s tone classes', (status) => {
    render(<RoomStatusBadge status={status} />);

    expect(screen.getByText(labels[status])).toHaveClass(
      ...statusToneClass[roomStatusTone[status]].split(' '),
    );
  });

  it('maps a sellable room to positive and an out-of-order room to critical', () => {
    expect(roomStatusTone.VACANT_CLEAN).toBe('positive');
    expect(roomStatusTone.OUT_OF_ORDER).toBe('critical');
  });

  it('maps every dirty room to caution', () => {
    expect(roomStatusTone.VACANT_DIRTY).toBe('caution');
    expect(roomStatusTone.OCCUPIED_DIRTY).toBe('caution');
  });

  it('should apply custom className', () => {
    render(<RoomStatusBadge status="VACANT_CLEAN" className="custom-class" />);

    const badge = screen.getByText(t('rooms.status.VACANT_CLEAN'));
    expect(badge).toHaveClass('custom-class');
  });

  it('should keep status labels on one line', () => {
    render(<RoomStatusBadge status="OCCUPIED_DIRTY" />);

    expect(screen.getByText(t('rooms.status.OCCUPIED_DIRTY'))).toHaveClass(
      'whitespace-nowrap',
      'shrink-0',
    );
  });
});
