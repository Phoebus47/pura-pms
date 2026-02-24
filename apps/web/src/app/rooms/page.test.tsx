/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RoomsPage from './page';
import { roomsAPI } from '@/lib/api';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  roomsAPI: {
    getAll: vi.fn(),
  },
}));

describe('RoomsPage', () => {
  const mockPush = vi.fn();
  const mockRooms = [
    {
      id: '1',
      number: '101',
      floor: 1,
      status: 'VACANT_CLEAN',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      roomType: {
        id: 'type1',
        name: 'Standard',
        code: 'STD',
        baseRate: 1000,
        maxAdults: 2,
        maxChildren: 0,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      number: '102',
      floor: 1,
      status: 'OCCUPIED_CLEAN',
      roomTypeId: 'type1',
      propertyId: 'prop1',
      roomType: {
        id: 'type1',
        name: 'Standard',
        code: 'STD',
        baseRate: 1000,
        maxAdults: 2,
        maxChildren: 0,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    (useRouter as any).mockReturnValue({ push: mockPush });
    (roomsAPI.getAll as any).mockResolvedValue(mockRooms);
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    (roomsAPI.getAll as any).mockReturnValue(new Promise(() => {}));

    render(<RoomsPage />);

    expect(screen.getByText('Loading rooms...')).toBeInTheDocument();
  });

  it('should display rooms after loading', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Rooms')).toBeInTheDocument();
    });

    expect(screen.getByText('Room 101')).toBeInTheDocument();
    expect(screen.getByText('Room 102')).toBeInTheDocument();
  });

  it('should display error message if loading fails', async () => {
    const errorMessage = 'Failed to load rooms';
    (roomsAPI.getAll as any).mockRejectedValue(new Error(errorMessage));

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading rooms')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display string error message if loading fails with non-Error', async () => {
    (roomsAPI.getAll as any).mockRejectedValue('String Error');

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading rooms')).toBeInTheDocument();
      expect(screen.getByText('Failed to load rooms')).toBeInTheDocument();
    });
  });

  it('should navigate to room detail page when room card is clicked', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const roomCard = screen.getByText('Room 101').closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    expect(mockPush).toHaveBeenCalledWith('/rooms/1');
  });

  it('should display empty state when no rooms', async () => {
    (roomsAPI.getAll as any).mockResolvedValue([]);

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('No rooms found')).toBeInTheDocument();
      expect(
        screen.getByText('Get started by adding your first room'),
      ).toBeInTheDocument();
    });
  });

  it('should display empty state with filter message when no rooms and filter applied', async () => {
    (roomsAPI.getAll as any).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<RoomsPage />);

    // We expect 0 rooms
    await waitFor(() => {
      expect(screen.getByText('No rooms found')).toBeInTheDocument();
    });

    const vacantCleanBadge = screen.getAllByText('Vacant Clean')[0];
    await user.click(vacantCleanBadge);

    await waitFor(() => {
      expect(screen.getByText('Try changing the filter')).toBeInTheDocument();
    });
  });

  it('should display room status summary', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      const vacantCleanElements = screen.getAllByText('Vacant Clean');
      expect(vacantCleanElements.length).toBeGreaterThan(0);
      const occupiedCleanElements = screen.getAllByText('Occupied Clean');
      expect(occupiedCleanElements.length).toBeGreaterThan(0);
    });
  });
  it('filters rooms by status', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);
    await waitFor(() =>
      expect(screen.getByText('Room 101')).toBeInTheDocument(),
    );

    // Click Vacant Clean filter (using class or text check carefully)
    // The previous test found multiple 'Vacant Clean', likely due to Badges + Filter buttons.
    // The filter buttons contain the count "1" and the badge "Vacant Clean".

    // We can find the button by the count "1" inside the grid.
    screen.getAllByRole('button');
    // Identify the specific filter button - simplistic approach for now:
    // Or assert getAll was called with undefined first.
    expect(roomsAPI.getAll).toHaveBeenLastCalledWith(undefined);

    // Find the button that toggles filter.
    // Let's filter by OCCUPIED_CLEAN (Room 102).
    const occupiedCleanBadge = screen.getAllByText('Occupied Clean')[0];
    // Wait, getAllByText might match the badge inside the button.
    // Click it.
    await user.click(occupiedCleanBadge);

    await waitFor(() => {
      expect(roomsAPI.getAll).toHaveBeenLastCalledWith({
        status: 'OCCUPIED_CLEAN',
      });
    });

    // Toggle off - Re-query because the component re-rendered
    const occupiedCleanBadgeOff = screen.getAllByText('Occupied Clean')[0];
    await user.click(occupiedCleanBadgeOff);

    await waitFor(() => {
      expect(roomsAPI.getAll).toHaveBeenLastCalledWith(undefined);
    });
  });

  it('retries loading on error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to load rooms';
    (roomsAPI.getAll as any)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce(mockRooms);

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading rooms')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Try Again'));

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });
  });
});
