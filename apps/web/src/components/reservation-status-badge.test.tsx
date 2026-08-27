import { render, screen } from '@testing-library/react';
import {
  ReservationStatusBadge,
  reservationStatusTone,
} from './reservation-status-badge';
import { statusToneClass } from '@/lib/design/status-tone';
import type { ReservationStatus } from '@/lib/api/reservations';

describe('ReservationStatusBadge', () => {
  const statuses: ReservationStatus[] = [
    'TENTATIVE',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
    'WALKED',
  ];

  const labels: Record<ReservationStatus, string> = {
    TENTATIVE: 'Tentative',
    CONFIRMED: 'Confirmed',
    CHECKED_IN: 'Checked In',
    CHECKED_OUT: 'Checked Out',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',
    WALKED: 'Walked',
  };

  it.each(statuses)('should render %s status correctly', (status) => {
    render(<ReservationStatusBadge status={status} />);

    expect(screen.getByText(labels[status])).toBeInTheDocument();
  });

  it.each(statuses)('should apply the %s tone classes', (status) => {
    render(<ReservationStatusBadge status={status} />);

    expect(screen.getByText(labels[status])).toHaveClass(
      ...statusToneClass[reservationStatusTone[status]].split(' '),
    );
  });

  it('maps an active stay to positive and a cancelled stay to critical', () => {
    expect(reservationStatusTone.CHECKED_IN).toBe('positive');
    expect(reservationStatusTone.CANCELLED).toBe('critical');
  });

  it('keeps exceptions that still need desk action on caution', () => {
    expect(reservationStatusTone.NO_SHOW).toBe('caution');
    expect(reservationStatusTone.WALKED).toBe('caution');
    expect(reservationStatusTone.TENTATIVE).toBe('caution');
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
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-2xs');
  });

  it('should render default size correctly', () => {
    render(<ReservationStatusBadge status="CONFIRMED" size="default" />);

    const badge = screen.getByText('Confirmed');
    expect(badge).toHaveClass('px-2.5', 'py-1', 'text-xs');
  });

  it('should keep status labels on one line', () => {
    render(<ReservationStatusBadge status="CHECKED_IN" />);

    expect(screen.getByText('Checked In')).toHaveClass(
      'whitespace-nowrap',
      'shrink-0',
    );
  });
});
