import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Dashboard from './page';
import { reservationsAPI, roomsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  reservationsAPI: {
    getAll: jest.fn(),
  },
  roomsAPI: {
    getAll: jest.fn(),
  },
}));

jest.mock('@/lib/toast', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('Dashboard', () => {
  const mockPush = jest.fn();
  const mockReservations = [
    {
      id: '1',
      confirmNumber: 'RES001',
      checkIn: '2024-01-15',
      checkOut: '2024-01-17',
      status: 'CHECKED_IN',
      totalAmount: 2000,
      guest: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
      room: {
        id: '1',
        number: '101',
      },
    },
  ];

  const mockRooms = [
    {
      id: '1',
      number: '101',
      floor: 1,
      status: 'VACANT_CLEAN',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
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
    (roomsAPI.getAll as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should display dashboard stats after loading', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Reservations')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Available Rooms')).toBeInTheDocument();
  });

  it('should display recent reservations', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Reservations')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Room 101|101/)).toBeInTheDocument();
  });

  it('should navigate to new reservation page when button is clicked', async () => {
    const user = userEvent.setup();
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('New Reservation')).toBeInTheDocument();
    });

    await user.click(screen.getByText('New Reservation'));

    expect(mockPush).toHaveBeenCalledWith('/reservations/new');
  });

  it('should display error message if data loading fails', async () => {
    const errorMessage = 'Failed to load dashboard data';
    (reservationsAPI.getAll as jest.Mock).mockRejectedValue(
      new Error(errorMessage),
    );
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should display "No recent reservations" when there are no reservations', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue([]);
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('No recent reservations')).toBeInTheDocument();
    });
  });

  it('should display error message if data loading fails with non-Error', async () => {
    (reservationsAPI.getAll as jest.Mock).mockRejectedValue('String Error');
    (roomsAPI.getAll as jest.Mock).mockResolvedValue(mockRooms);

    render(<Dashboard />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to load dashboard data');
    });
  });

  it('should handle zero rooms for occupancy calculation', async () => {
    (reservationsAPI.getAll as jest.Mock).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as jest.Mock).mockResolvedValue([]);

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('0% occupancy')).toBeInTheDocument();
    });
  });
});
