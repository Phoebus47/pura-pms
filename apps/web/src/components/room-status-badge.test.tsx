import { render, screen } from '@testing-library/react';
import { RoomStatusBadge, roomStatusTone } from './room-status-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import type { RoomStatus } from '@/lib/api/rooms';

describe('RoomStatusBadge', () => {
  const labels: Record<RoomStatus, string> = {
    VACANT_CLEAN: 'Vacant Clean',
    VACANT_DIRTY: 'Vacant Dirty',
    OCCUPIED_CLEAN: 'Occupied Clean',
    OCCUPIED_DIRTY: 'Occupied Dirty',
    OUT_OF_ORDER: 'Out of Order',
    OUT_OF_SERVICE: 'Out of Service',
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

    const badge = screen.getByText('Vacant Clean');
    expect(badge).toHaveClass('custom-class');
  });

  it('should keep status labels on one line', () => {
    render(<RoomStatusBadge status="OCCUPIED_DIRTY" />);

    expect(screen.getByText('Occupied Dirty')).toHaveClass(
      'whitespace-nowrap',
      'shrink-0',
    );
  });
});
