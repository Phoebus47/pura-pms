import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ReservationsPage from './page';
import { reservationsAPI } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  reservationsAPI: {
    getAll: jest.fn(),
  },
}));

describe('ReservationsPage', () => {
  const mockPush = jest.fn();
  const mockReservations = [
    {
      id: '1',
      confirmNumber: 'RES001',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      status: 'CONFIRMED',
      totalAmount: 2000,
      nights: 2,
      guest: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      room: {
        id: '1',
        number: '101',
        roomType: {
          name: 'Standard',
        },
      },
    },
    {
      id: '2',
      confirmNumber: 'RES002',
      checkIn: '2024-01-20',
      checkOut: '2024-01-22',
      status: 'CHECKED_IN',
      totalAmount: 3000,
      nights: 2,
      guest: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
      },
      room: {
        id: '2',
        number: '102',
        roomType: {
          name: 'Deluxe',
        },
      },
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (reservationsAPI.getAll as jest.Mock).mockReturnValue(
      new Promise(() => {}),
    );

    render(<ReservationsPage />);

    expect(screen.getByText('Loading reservations...')).toBeInTheDocument();
  });

  it('should display reservations after loading', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reservations')).toBeInTheDocument();
    });

    await waitFor(() => {
      const johnElements = screen.getAllByText(/John Doe/i);
      expect(johnElements.length).toBeGreaterThan(0);
      const janeElements = screen.getAllByText(/Jane Smith/i);
      expect(janeElements.length).toBeGreaterThan(0);
      const res001Elements = screen.getAllByText('RES001');
      expect(res001Elements.length).toBeGreaterThan(0);
      const res002Elements = screen.getAllByText('RES002');
      expect(res002Elements.length).toBeGreaterThan(0);
    });
  });

  it('should display error message if loading fails', async () => {
    const errorMessage = 'Failed to load reservations';
    (reservationsAPI.getAll as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Error loading reservations'),
      ).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should navigate to new reservation page when button is clicked', async () => {
    const user = userEvent.setup();
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('New Reservation')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New Reservation'));

    expect(mockPush).toHaveBeenCalledWith('/reservations/new');
  });

  it('should navigate to reservation detail when row is clicked', async () => {
    const user = userEvent.setup();
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);

    render(<ReservationsPage />);

    await waitFor(() => {
      const res001Elements = screen.getAllByText('RES001');
      expect(res001Elements.length).toBeGreaterThan(0);
    });

    const res001Elements = screen.getAllByText('RES001');
    const reservationRow = res001Elements[0].closest('tr');
    if (reservationRow) {
      await user.click(reservationRow);
    } else {
      const mobileButton = res001Elements[0].closest('button');
      if (mobileButton) {
        await user.click(mobileButton);
      }
    }

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/reservations/1');
    });
  });

  it('should display empty state when no reservations', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue([]);

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(screen.getByText('No reservations yet')).toBeInTheDocument();
    });
  });

  it('should display reservation status badges', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);

    render(<ReservationsPage />);

    await waitFor(() => {
      const confirmedElements = screen.getAllByText(/confirmed/i);
      expect(confirmedElements.length).toBeGreaterThan(0);
      const checkedInElements = screen.getAllByText(/checked in/i);
      expect(checkedInElements.length).toBeGreaterThan(0);
    });
  });

  it('should display default error message if loading fails with non-Error', async () => {
    (reservationsAPI.getAll as jest.Mock).mockRejectedValue('String Error');

    render(<ReservationsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load reservations'),
      ).toBeInTheDocument();
    });
  });
});
