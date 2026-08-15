import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  canMarkNoShow,
  ReservationNoShowButton,
} from './reservation-no-show-button';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  reservationsAPI: {
    markNoShow: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const dueReservation = {
  id: 'res-1',
  status: 'CONFIRMED',
  checkIn: '2024-01-01T00:00:00.000Z',
} as Reservation;

describe('canMarkNoShow', () => {
  it('allows a confirmed arrival on or before the as-of date', () => {
    expect(
      canMarkNoShow(dueReservation, new Date('2024-01-01T12:00:00.000Z')),
    ).toBe(true);
    expect(
      canMarkNoShow(
        { ...dueReservation, checkIn: '2024-01-02' },
        new Date('2024-01-01T12:00:00.000Z'),
      ),
    ).toBe(false);
  });

  it('rejects statuses other than confirmed', () => {
    expect(
      canMarkNoShow(
        { ...dueReservation, status: 'CHECKED_IN' },
        new Date('2024-01-01T12:00:00.000Z'),
      ),
    ).toBe(false);
  });
});

describe('ReservationNoShowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('marks a due confirmed reservation as no-show', async () => {
    vi.mocked(reservationsAPI.markNoShow).mockResolvedValue(dueReservation);
    const onMarked = vi.fn();

    render(
      <ReservationNoShowButton
        reservation={dueReservation}
        onMarked={onMarked}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: t('reservations.noShow.action') }),
    );

    await waitFor(() => {
      expect(reservationsAPI.markNoShow).toHaveBeenCalledWith('res-1', {
        userId: 'usr_mock_1',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      t('reservations.noShow.success'),
    );
    expect(onMarked).toHaveBeenCalled();
  });

  it('hides the action when the arrival is still in the future', () => {
    render(
      <ReservationNoShowButton
        reservation={{
          ...dueReservation,
          checkIn: '2099-01-01T00:00:00.000Z',
        }}
        onMarked={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: t('reservations.noShow.action') }),
    ).not.toBeInTheDocument();
  });

  it('does nothing when the cashier cancels the confirm dialog', async () => {
    vi.mocked(window.confirm).mockReturnValue(false);

    render(
      <ReservationNoShowButton
        reservation={dueReservation}
        onMarked={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: t('reservations.noShow.action') }),
    );

    expect(reservationsAPI.markNoShow).not.toHaveBeenCalled();
  });

  it('toasts an error when marking no-show fails', async () => {
    vi.mocked(reservationsAPI.markNoShow).mockRejectedValue(
      new Error('Only confirmed reservations can be marked no-show'),
    );

    render(
      <ReservationNoShowButton
        reservation={dueReservation}
        onMarked={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: t('reservations.noShow.action') }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Only confirmed reservations can be marked no-show',
      );
    });
  });
});
