import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter } from 'next/navigation';
import RoomDetailPage from './page';
import { roomsAPI } from '@/lib/api';
import type { Room } from '@/lib/api';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/lib/api', () => ({
  roomsAPI: {
    getById: jest.fn(),
    delete: jest.fn(),
  },
}));

global.confirm = jest.fn();
global.alert = jest.fn();

describe('RoomDetailPage', () => {
  const mockRoom: Room = {
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
      maxOccupancy: 2,
      description: 'Standard room',
      amenities: ['WiFi', 'TV'],
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ id: '1' });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  it('should show loading state initially', () => {
    (roomsAPI.getById as jest.Mock).mockImplementation(
      () => new Promise(() => {}),
    );

    render(<RoomDetailPage />);

    expect(screen.getByText('Loading room details...')).toBeInTheDocument();
  });

  it('should display room details when loaded', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    expect(screen.getByText('Floor 1')).toBeInTheDocument();
    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getAllByText('Standard').length).toBeGreaterThan(0);
    expect(screen.getByText('฿1,000')).toBeInTheDocument();
    expect(screen.getByText('2 guests')).toBeInTheDocument();
  });

  it('should display room type amenities', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('WiFi')).toBeInTheDocument();
    });

    expect(screen.getByText('TV')).toBeInTheDocument();
  });

  it('should handle edit button click', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);

    const user = userEvent.setup();

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    expect(mockPush).toHaveBeenCalledWith('/rooms/1/edit');
  });

  it('should handle delete button click', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);
    (roomsAPI.delete as jest.Mock).mockResolvedValue(undefined);

    const user = userEvent.setup();

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(roomsAPI.delete).toHaveBeenCalledWith('1');
    });

    expect(mockPush).toHaveBeenCalledWith('/rooms');
  });

  it('should not delete if user cancels confirmation', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);
    (global.confirm as jest.Mock).mockReturnValue(false);

    const user = userEvent.setup();

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    expect(roomsAPI.delete).not.toHaveBeenCalled();
  });

  it('should display error when room not found', async () => {
    (roomsAPI.getById as jest.Mock).mockRejectedValue(
      new Error('Room not found'),
    );

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading room')).toBeInTheDocument();
    });

    expect(screen.getByText('Room not found')).toBeInTheDocument();
  });

  it('should handle delete error', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);
    (roomsAPI.delete as jest.Mock).mockRejectedValue(
      new Error('Delete failed'),
    );

    const user = userEvent.setup();

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('should render room without optional fields', async () => {
    const minimalRoom: Room = {
      id: '2',
      number: '102',
      floor: 2,
      status: 'OCCUPIED_DIRTY',
      roomTypeId: 'type2',
      propertyId: 'prop1',
      roomType: {
        id: 'type2',
        name: 'Basic',
        code: 'BSC',
        baseRate: 500,
        maxOccupancy: 1,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (roomsAPI.getById as jest.Mock).mockResolvedValue(minimalRoom);

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });

    // No notes section
    expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    // No amenities
    expect(screen.queryByText('Amenities')).not.toBeInTheDocument();
  });

  it('should display notes when present', async () => {
    const roomWithNotes: Room = {
      ...mockRoom,
      notes: 'Accessible room',
    };

    (roomsAPI.getById as jest.Mock).mockResolvedValue(roomWithNotes);

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Accessible room')).toBeInTheDocument();
    });
  });

  it('should handle non-Error exception in loadRoom', async () => {
    (roomsAPI.getById as jest.Mock).mockRejectedValue('String error');

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading room')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load room')).toBeInTheDocument();
  });

  it('should handle non-Error exception in handleDelete', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(mockRoom);
    (roomsAPI.delete as jest.Mock).mockRejectedValue('String error');

    const user = userEvent.setup();

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to delete room');
    });
  });

  it('should handle null room response', async () => {
    (roomsAPI.getById as jest.Mock).mockResolvedValue(null);

    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading room')).toBeInTheDocument();
    });

    expect(screen.getByText('Room not found')).toBeInTheDocument();
  });
});
