import { render, screen } from '@testing-library/react';
import { RoomStatusBadge } from './room-status-badge';
import type { RoomStatus } from '@/lib/api/rooms';

describe('RoomStatusBadge', () => {
  const statuses: RoomStatus[] = [
    'VACANT_CLEAN',
    'VACANT_DIRTY',
    'OCCUPIED_CLEAN',
    'OCCUPIED_DIRTY',
    'OUT_OF_ORDER',
    'OUT_OF_SERVICE',
  ];

  it.each(statuses)('should render %s status correctly', (status) => {
    render(<RoomStatusBadge status={status} />);

    const badge = screen.getByText(
      status === 'VACANT_CLEAN'
        ? 'Vacant Clean'
        : status === 'VACANT_DIRTY'
          ? 'Vacant Dirty'
          : status === 'OCCUPIED_CLEAN'
            ? 'Occupied Clean'
            : status === 'OCCUPIED_DIRTY'
              ? 'Occupied Dirty'
              : status === 'OUT_OF_ORDER'
                ? 'Out of Order'
                : 'Out of Service',
    );

    expect(badge).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<RoomStatusBadge status="VACANT_CLEAN" className="custom-class" />);

    const badge = screen.getByText('Vacant Clean');
    expect(badge).toHaveClass('custom-class');
  });
});
