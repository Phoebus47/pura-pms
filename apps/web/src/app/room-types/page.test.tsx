import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomTypesPage from './page';
import { useRoomTypes } from '@/hooks/use-room-types';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

jest.mock('@/hooks/use-room-types', () => ({
  useRoomTypes: jest.fn(),
}));

jest.mock('@/components/ui/confirm-dialog', () => ({
  useConfirmDialog: jest.fn(),
}));

describe('RoomTypesPage', () => {
  const mockLoadRoomTypes = jest.fn();
  const mockDeleteRoomType = jest.fn();
  const mockConfirm = jest.fn();
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
    (useRoomTypes as jest.Mock).mockReturnValue({
      roomTypes: mockRoomTypes,
      loading: false,
      error: null,
      loadRoomTypes: mockLoadRoomTypes,
      deleteRoomType: mockDeleteRoomType,
    });
    (useConfirmDialog as jest.Mock).mockReturnValue({
      confirm: mockConfirm,
      Dialog: mockDialog,
    });
    jest.clearAllMocks();
  });

  it('should display loading state', () => {
    (useRoomTypes as jest.Mock).mockReturnValue({
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
    (useRoomTypes as jest.Mock).mockReturnValue({
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

  it('should display empty state when no room types', () => {
    (useRoomTypes as jest.Mock).mockReturnValue({
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

    expect(mockConfirm).toHaveBeenCalled();
  });
});
