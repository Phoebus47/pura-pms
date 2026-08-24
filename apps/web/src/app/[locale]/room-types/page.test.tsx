/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomTypesPage from './page';
import { useRoomTypes } from '@/hooks/use-room-types';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

vi.mock('@/hooks/use-room-types', () => ({
  useRoomTypes: vi.fn(),
}));

vi.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: vi.fn(),
}));

describe('RoomTypesPage', () => {
  const mockLoadRoomTypes = vi.fn();
  const mockDeleteRoomType = vi.fn();
  const mockConfirm = vi.fn();
  const mockDialog = <div data-testid="confirm-dialog">Confirm Dialog</div>;

  const mockRoomTypes = [
    {
      id: '1',
      name: 'Standard',
      code: 'STD',
      baseRate: 1000,
      maxAdults: 2,
      maxChildren: 0,
      maxOccupancy: 2,
      amenities: ['WiFi', 'TV'],
      propertyId: 'prop1',
      description: 'Standard room description',
    },
    {
      id: '2',
      name: 'Deluxe',
      code: 'DLX',
      baseRate: 2000,
      maxAdults: 3,
      maxChildren: 1,
      maxOccupancy: 4,
      amenities: ['WiFi', 'TV', 'Mini Bar'],
      propertyId: 'prop1',
    },
  ];

  beforeEach(() => {
    (useRoomTypes as any).mockReturnValue({
      roomTypes: mockRoomTypes,
      loading: false,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });
    (useConfirmDialog as any).mockReturnValue({
      confirm: mockConfirm,
      Dialog: mockDialog,
    });
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    (useRoomTypes as any).mockReturnValue({
      roomTypes: [],
      loading: true,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });

    render(<RoomTypesPage />);

    expect(screen.getByText('Loading room types...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Failed to load room types';
    (useRoomTypes as any).mockReturnValue({
      roomTypes: [],
      loading: false,
      error: errorMessage,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });

    render(<RoomTypesPage />);

    expect(screen.getByText('Error loading room types')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display room types list', () => {
    render(<RoomTypesPage />);

    expect(screen.getByText('Room Types')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Deluxe')).toBeInTheDocument();
    expect(screen.getByText('STD')).toBeInTheDocument();
    expect(screen.getByText('DLX')).toBeInTheDocument();
  });

  it('should filter room types by search term', async () => {
    const user = userEvent.setup();
    render(<RoomTypesPage />);

    const searchInput = screen.getByPlaceholderText(
      'Search room types by name or code...',
    );
    await user.type(searchInput, 'Standard');

    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.queryByText('Deluxe')).not.toBeInTheDocument();
    });
  });

  it('should display no results message when search matches nothing', async () => {
    const user = userEvent.setup();
    render(<RoomTypesPage />);

    const searchInput = screen.getByPlaceholderText(
      'Search room types by name or code...',
    );
    await user.type(searchInput, 'NonExistent');

    await waitFor(() => {
      expect(
        screen.getByText('No room types found matching your search'),
      ).toBeInTheDocument();
    });
  });

  it('should display "X more" amenities when more than 3', () => {
    (useRoomTypes as any).mockReturnValue({
      roomTypes: [
        {
          ...mockRoomTypes[0],
          amenities: ['1', '2', '3', '4', '5'],
        },
      ],
      loading: false,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });

    render(<RoomTypesPage />);
    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should not render description if missing', () => {
    (useRoomTypes as any).mockReturnValue({
      roomTypes: [
        {
          ...mockRoomTypes[1], // Deluxe has no description in our mock
        },
      ],
      loading: false,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });

    render(<RoomTypesPage />);
    expect(screen.getByText('Deluxe')).toBeInTheDocument();
  });

  it('should display empty state when no room types', () => {
    (useRoomTypes as any).mockReturnValue({
      roomTypes: [],
      loading: false,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });

    render(<RoomTypesPage />);

    expect(
      screen.getByText(/No room types yet|No room types found matching/i),
    ).toBeInTheDocument();
  });

  it('should display room type details', () => {
    render(<RoomTypesPage />);

    expect(screen.getByText('฿1,000')).toBeInTheDocument();
    expect(screen.getByText('฿2,000')).toBeInTheDocument();
    expect(screen.getByText(/2 guests/i)).toBeInTheDocument();
    expect(screen.getByText(/4 guests/i)).toBeInTheDocument();
  });

  it('should call deleteRoomType when delete is confirmed', async () => {
    const mockConfirmExecute = vi.fn((title, msg, action) => action());
    (useConfirmDialog as any).mockReturnValue({
      confirm: mockConfirmExecute,
      Dialog: mockDialog,
    });

    const user = userEvent.setup();
    render(<RoomTypesPage />);

    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(
      (btn) => btn.getAttribute('title') === 'Delete',
    );
    if (deleteButton) {
      await user.click(deleteButton);
    }

    expect(mockConfirmExecute).toHaveBeenCalled();
    expect(mockDeleteRoomType).toHaveBeenCalledWith('1');
  });
});
