import { render, screen } from '@testing-library/react';
import { ReservationStatusBadge } from './reservation-status-badge';
import type { ReservationStatus } from '@/lib/api/reservations';

describe('ReservationStatusBadge', () => {
  const statuses: ReservationStatus[] = [
    'TENTATIVE',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
  ];

  it.each(statuses)('should render %s status correctly', (status) => {
    render(<ReservationStatusBadge status={status} />);

    const badge = screen.getByText(
      status === 'TENTATIVE'
        ? 'Tentative'
        : status === 'CONFIRMED'
          ? 'Confirmed'
          : status === 'CHECKED_IN'
            ? 'Checked In'
            : status === 'CHECKED_OUT'
              ? 'Checked Out'
              : status === 'CANCELLED'
                ? 'Cancelled'
                : 'No Show',
    );

    expect(badge).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <ReservationStatusBadge status="CONFIRMED" className="custom-class" />,
    );

    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('custom-class');
  });

  it('should render xs size correctly', () => {
    render(<ReservationStatusBadge status="CONFIRMED" size="xs" />);

    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-[10px]');
  });

  it('should render default size correctly', () => {
    render(<ReservationStatusBadge status="CONFIRMED" size="default" />);

    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-xs');
  });
});
