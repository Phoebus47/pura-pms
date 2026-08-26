/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './page';
import { reservationsAPI, roomsAPI } from '@/lib/api';
import { toast } from '@/lib/toast';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api', () => ({
  reservationsAPI: {
    getAll: vi.fn(),
  },
  roomsAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('Shift Ops dashboard', () => {
  const mockReservations = [
    {
      id: '1',
      confirmNumber: 'RES001',
      checkIn: '2024-01-15T14:00:00.000Z',
      checkOut: '2024-01-16T12:00:00.000Z',
      status: 'CONFIRMED',
      totalAmount: 2000,
      paidAmount: 0,
      roomId: '1',
      guestId: '1',
      guest: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      },
      room: {
        id: '1',
        number: '101',
        roomType: {
          id: 't1',
          name: 'Deluxe',
          code: 'DLX',
          baseRate: 2000,
        },
        property: { id: 'p1', name: 'Pura Resort' },
      },
    },
    {
      id: '2',
      confirmNumber: 'RES002',
      checkIn: '2024-01-14T14:00:00.000Z',
      checkOut: '2024-01-15T12:00:00.000Z',
      status: 'CHECKED_IN',
      totalAmount: 3000,
      paidAmount: 1000,
      roomId: '2',
      guestId: '2',
      isRoomLocked: true,
      guest: {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      room: {
        id: '2',
        number: '102',
        roomType: {
          id: 't1',
          name: 'Deluxe',
          code: 'DLX',
          baseRate: 2000,
        },
        property: { id: 'p1', name: 'Pura Resort' },
      },
    },
  ];

  const mockRooms = [
    {
      id: '1',
      number: '101',
      status: 'VACANT_CLEAN',
      hkStage: 'READY',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      property: { id: 'p1', name: 'Pura Resort' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      number: '102',
      status: 'OCCUPIED_DIRTY',
      hkStage: 'DIRTY',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      property: { id: 'p1', name: 'Pura Resort' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
    mockPush.mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows loading state', () => {
    (reservationsAPI.getAll as any).mockReturnValue(new Promise(() => {}));
    (roomsAPI.getAll as any).mockReturnValue(new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByText(/Loading Shift Ops/i)).toBeInTheDocument();
  });

  it('renders Shift Ops queues with remaining totals', async () => {
    (reservationsAPI.getAll as any).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pura Resort')).toBeInTheDocument();
    });

    expect(screen.getByText('Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Departures')).toBeInTheDocument();
    expect(screen.getByText("Today's work")).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Check-in' })).toHaveAttribute(
      'href',
      '/reservations/1',
    );
  });

  it('shows exception chips when dirty or VIP/locked', async () => {
    (reservationsAPI.getAll as any).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Needs attention')).toBeInTheDocument();
    });

    expect(screen.getByText('Dirty rooms')).toBeInTheDocument();
    expect(screen.getByText('VIP / locked')).toBeInTheDocument();
  });

  it('links new reservation CTA', async () => {
    (reservationsAPI.getAll as any).mockResolvedValue(mockReservations);
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /New reservation/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /New reservation/i }),
    ).toHaveAttribute('href', '/reservations/new');
  });

  it('toasts when dashboard load fails', async () => {
    (reservationsAPI.getAll as any).mockRejectedValue(new Error('boom'));
    (roomsAPI.getAll as any).mockResolvedValue([]);

    render(<Dashboard />);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('boom');
    });
  });

  it('shows empty work list when nothing is due', async () => {
    (reservationsAPI.getAll as any).mockResolvedValue([]);
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /No arrivals, departures, or unassigned stays need action/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
