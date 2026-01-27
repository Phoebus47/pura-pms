import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationDetailPage from './page';
import { reservationsAPI } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';

jest.mock('@/lib/api', () => ({
  reservationsAPI: {
    getById: jest.fn(),
    checkIn: jest.fn(),
    checkOut: jest.fn(),
    cancel: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/components/reservation-status-badge', () => ({
  ReservationStatusBadge: ({ status }: { status: string }) => (
    <div>Status: {status}</div>
  ),
}));

describe('ReservationDetailPage', () => {
  const mockReservation = {
    id: 'res-1',
    confirmNumber: 'CN-123',
    status: 'CONFIRMED',
    guest: { firstName: 'John', lastName: 'Doe', email: 'j@example.com' },
    room: { number: '101', roomType: { name: 'Deluxe', baseRate: 1000 } },
    checkIn: '2024-01-01',
    checkOut: '2024-01-05',
    nights: 4,
    numberOfGuests: 2,
    totalAmount: 4000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
    (useParams as jest.Mock).mockReturnValue({ id: 'res-1' });
    (reservationsAPI.getById as jest.Mock).mockResolvedValue(mockReservation);
  });

  it('renders details', async () => {
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handle error', async () => {
    (reservationsAPI.getById as jest.Mock).mockRejectedValue(
      new Error('Failed'),
    );
    render(<ReservationDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading reservation')).toBeInTheDocument();
    });
  });

  it('handles check in', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check In'));
    expect(reservationsAPI.checkIn).toHaveBeenCalledWith('res-1');
  });

  it('handles cancellation', async () => {
    jest.spyOn(window, 'prompt').mockReturnValue('Plans changed');
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Cancel'));
    expect(reservationsAPI.cancel).toHaveBeenCalledWith(
      'res-1',
      'Plans changed',
    );
  });

  it('handles deletion', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    expect(reservationsAPI.delete).toHaveBeenCalledWith('res-1');
    expect(mockPush).toHaveBeenCalledWith('/reservations');
  });
  it('cancels check in', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check In'));
    expect(reservationsAPI.checkIn).not.toHaveBeenCalled();
  });

  it('handles check in error', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.checkIn as jest.Mock).mockRejectedValue(
      new Error('Check-in failed'),
    );

    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check In'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-in failed');
    });
  });

  it('cancels cancellation request', async () => {
    jest.spyOn(window, 'prompt').mockReturnValue(null); // User cancelled
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Cancel'));
    expect(reservationsAPI.cancel).not.toHaveBeenCalled();
  });

  it('handles cancellation error', async () => {
    jest.spyOn(window, 'prompt').mockReturnValue('Reason');
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.cancel as jest.Mock).mockRejectedValue(
      new Error('Cancel failed'),
    );

    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Cancel'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Cancel failed');
    });
  });

  it('cancels deletion', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    expect(reservationsAPI.delete).not.toHaveBeenCalled();
  });

  it('handles deletion error', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.delete as jest.Mock).mockRejectedValue(
      new Error('Delete failed'),
    );

    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('handles check out', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue({
      ...mockReservation,
      status: 'CHECKED_IN',
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Check Out')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check Out'));
    expect(reservationsAPI.checkOut).toHaveBeenCalledWith('res-1');
  });

  it('cancels check out', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue({
      ...mockReservation,
      status: 'CHECKED_IN',
    });
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Check Out')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check Out'));
    expect(reservationsAPI.checkOut).not.toHaveBeenCalled();
  });

  it('handles check out error', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue({
      ...mockReservation,
      status: 'CHECKED_IN',
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.checkOut as jest.Mock).mockRejectedValue(
      new Error('Check-out failed'),
    );

    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getByText('Check Out')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Check Out'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Check-out failed');
    });
  });

  it('navigates back from header', async () => {
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates back from error state', async () => {
    (reservationsAPI.getById as jest.Mock).mockRejectedValue(new Error('Fail'));
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Error loading reservation')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Go Back'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders full reservation details', async () => {
    const fullReservation = {
      ...mockReservation,
      specialRequests: 'Late check-in',
      cancellationReason: 'Flight cancelled',
      actualCheckIn: '2024-01-01T14:00:00Z',
      actualCheckOut: '2024-01-05T10:00:00Z',
    };
    (reservationsAPI.getById as jest.Mock).mockResolvedValue(fullReservation);

    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Late check-in')).toBeInTheDocument(),
    );
    expect(screen.getByText('Flight cancelled')).toBeInTheDocument();

    // Check actual times are rendered (using locale string format from component)
    // The component uses new Date().toLocaleString()
    // We just check that something time-related is rendered or the label exists
    expect(screen.getByText('Actual Check-in')).toBeInTheDocument();
    expect(screen.getByText('Actual Check-out')).toBeInTheDocument();
  });

  it('navigates to edit page', async () => {
    render(<ReservationDetailPage />);
    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByText('Edit'));
    expect(mockPush).toHaveBeenCalledWith('/reservations/res-1/edit');
  });

  it('renders singular nights and guests', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue({
      ...mockReservation,
      nights: 1,
      numberOfGuests: 1,
    });
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('1 night')).toBeInTheDocument(),
    );
    expect(screen.getByText('1 guest')).toBeInTheDocument();
  });

  it('handles non-Error objects in load', async () => {
    (reservationsAPI.getById as jest.Mock).mockRejectedValue('String error');
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(
        screen.getByText('Failed to load reservation'),
      ).toBeInTheDocument(),
    );
  });

  it('renders not found state when data is null', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue(null);
    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getByText('Reservation not found')).toBeInTheDocument(),
    );
  });

  it('handles non-Error objects in actions', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Check In
    (reservationsAPI.checkIn as jest.Mock).mockRejectedValue('Err');
    render(<ReservationDetailPage />);
    await waitFor(() => screen.getByText('Check In'));
    await userEvent.click(screen.getByText('Check In'));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to check in'),
    );

    // Check Out - reset and re-render or just use different test?
    // Easier to make a separate block or clean up?
    // We can do it in sequence if we reset properly, but separate tests are cleaner.
  });

  it('handles non-Error objects in check out', async () => {
    (reservationsAPI.getById as jest.Mock).mockResolvedValue({
      ...mockReservation,
      status: 'CHECKED_IN',
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.checkOut as jest.Mock).mockRejectedValue('Err');

    render(<ReservationDetailPage />);
    await waitFor(() => screen.getByText('Check Out'));
    await userEvent.click(screen.getByText('Check Out'));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to check out'),
    );
  });

  it('handles non-Error objects in cancel', async () => {
    jest.spyOn(window, 'prompt').mockReturnValue('Reason');
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.cancel as jest.Mock).mockRejectedValue('Err');

    render(<ReservationDetailPage />);
    await waitFor(() => screen.getByText('Cancel'));
    await userEvent.click(screen.getByText('Cancel'));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to cancel reservation'),
    );
  });

  it('handles non-Error objects in delete', async () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (reservationsAPI.delete as jest.Mock).mockRejectedValue('Err');

    render(<ReservationDetailPage />);
    await waitFor(() => screen.getByText('Delete'));
    await userEvent.click(screen.getByText('Delete'));
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to delete reservation'),
    );
  });

  it('renders details without room assigned', async () => {
    const noRoomReservation = {
      ...mockReservation,
      room: null,
      actualCheckIn: null,
      actualCheckOut: null,
      specialRequests: null,
      cancellationReason: null,
    };
    (reservationsAPI.getById as jest.Mock).mockResolvedValue(noRoomReservation);

    render(<ReservationDetailPage />);

    await waitFor(() =>
      expect(screen.getAllByText('CN-123')[0]).toBeInTheDocument(),
    );

    // Should default baseRate to 0
    // "Room Rate" section
    // We look for the formatted price "฿0"
    expect(screen.getByText('฿0')).toBeInTheDocument();
  });
});
