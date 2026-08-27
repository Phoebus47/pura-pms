/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import RoomsPage from './page';
import { roomsAPI } from '@/lib/api';
import { formatMessage, t } from '@/lib/i18n';

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

    expect(screen.getByText(t('rooms.loading'))).toBeInTheDocument();
  });

  it('should display rooms after loading', async () => {
    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText(t('rooms.title'))).toBeInTheDocument();
    });

    expect(
      screen.getByText(formatMessage('rooms.roomNumber', { number: '101' })),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatMessage('rooms.roomNumber', { number: '102' })),
    ).toBeInTheDocument();
  });

  it('should display error message if loading fails', async () => {
    const errorMessage = 'Failed to load rooms';
    (roomsAPI.getAll as any).mockRejectedValue(new Error(errorMessage));

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText(t('rooms.errorTitle'))).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display string error message if loading fails with non-Error', async () => {
    (roomsAPI.getAll as any).mockRejectedValue('String Error');

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText(t('rooms.errorTitle'))).toBeInTheDocument();
      expect(screen.getByText(t('rooms.loadFailed'))).toBeInTheDocument();
    });
  });

  it('should navigate to room detail page when room card is clicked', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(formatMessage('rooms.roomNumber', { number: '101' })),
      ).toBeInTheDocument();
    });

    const roomCard = screen
      .getByText(formatMessage('rooms.roomNumber', { number: '101' }))
      .closest('div');
    if (roomCard) {
      await user.click(roomCard);
    }

    expect(mockPush).toHaveBeenCalledWith('/rooms/1');
  });

  it('should display empty state when no rooms', async () => {
    (roomsAPI.getAll as any).mockResolvedValue([]);

    render(<RoomsPage />);

    await waitFor(() => {
      expect(screen.getByText(t('rooms.emptyTitle'))).toBeInTheDocument();
      expect(screen.getByText(t('rooms.emptyBody'))).toBeInTheDocument();
    });
  });

  it('should display empty state with filter message when no rooms and filter applied', async () => {
    (roomsAPI.getAll as any).mockResolvedValue([]);
    const user = userEvent.setup();

    render(<RoomsPage />);

    // We expect 0 rooms
    await waitFor(() => {
      expect(screen.getByText(t('rooms.emptyTitle'))).toBeInTheDocument();
    });

    const vacantCleanBadge = screen.getAllByText(
      t('rooms.status.VACANT_CLEAN'),
    )[0];
    await user.click(vacantCleanBadge);

    await waitFor(() => {
      expect(screen.getByText(t('rooms.emptyFilter'))).toBeInTheDocument();
    });
  });

  it('should display room status summary', async () => {
    const { container } = render(<RoomsPage />);

    await waitFor(() => {
      const vacantCleanElements = screen.getAllByText(
        t('rooms.status.VACANT_CLEAN'),
      );
      expect(vacantCleanElements.length).toBeGreaterThan(0);
      const occupiedCleanElements = screen.getAllByText(
        t('rooms.status.OCCUPIED_CLEAN'),
      );
      expect(occupiedCleanElements.length).toBeGreaterThan(0);
    });

    const summaryGrid = container.querySelector('.grid');
    expect(summaryGrid).toHaveClass('grid-cols-2', 'xl:grid-cols-6');
  });
  it('filters rooms by status', async () => {
    const user = userEvent.setup();
    render(<RoomsPage />);
    await waitFor(() =>
      expect(
        screen.getByText(formatMessage('rooms.roomNumber', { number: '101' })),
      ).toBeInTheDocument(),
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
    const occupiedCleanBadge = screen.getAllByText(
      t('rooms.status.OCCUPIED_CLEAN'),
    )[0];
    // Wait, getAllByText might match the badge inside the button.
    // Click it.
    await user.click(occupiedCleanBadge);

    await waitFor(() => {
      expect(roomsAPI.getAll).toHaveBeenLastCalledWith({
        status: 'OCCUPIED_CLEAN',
      });
    });

    // Toggle off - Re-query because the component re-rendered
    const occupiedCleanBadgeOff = screen.getAllByText(
      t('rooms.status.OCCUPIED_CLEAN'),
    )[0];
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
      expect(screen.getByText(t('rooms.errorTitle'))).toBeInTheDocument();
    });

    await user.click(screen.getByText(t('common.tryAgain')));

    await waitFor(() => {
      expect(
        screen.getByText(formatMessage('rooms.roomNumber', { number: '101' })),
      ).toBeInTheDocument();
    });
  });
});
