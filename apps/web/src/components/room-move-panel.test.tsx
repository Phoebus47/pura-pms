import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { RoomMovePanel } from './room-move-panel';
import { reservationsAPI, roomsAPI, type Reservation } from '@/lib/api';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  reservationsAPI: {
    moveRoom: vi.fn(),
    listRoomMoves: vi.fn(),
  },
  roomsAPI: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const reservation = {
  id: 'res-1',
  roomId: 'room-1',
  status: 'CHECKED_IN',
  room: {
    id: 'room-1',
    number: '101',
    roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX', baseRate: 1000 },
    property: { id: 'prop-1', name: 'Pura' },
  },
} as Reservation;

function renderPanel(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('RoomMovePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(roomsAPI.getAll).mockResolvedValue([
      {
        id: 'room-2',
        number: '102',
        status: 'VACANT_CLEAN',
        roomTypeId: 'rt-1',
        propertyId: 'prop-1',
        roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX', baseRate: 1000 },
      },
      {
        id: 'room-1',
        number: '101',
        status: 'OCCUPIED_CLEAN',
        roomTypeId: 'rt-1',
        propertyId: 'prop-1',
      },
      {
        id: 'room-3',
        number: '201',
        status: 'OCCUPIED_DIRTY',
        roomTypeId: 'rt-2',
        propertyId: 'prop-1',
      },
    ] as never);
    vi.mocked(reservationsAPI.listRoomMoves).mockResolvedValue([]);
  });

  it('lists vacant rooms and submits a move', async () => {
    vi.mocked(reservationsAPI.moveRoom).mockResolvedValue(reservation);
    const onMoved = vi.fn();
    renderPanel(<RoomMovePanel reservation={reservation} onMoved={onMoved} />);

    const select = await screen.findByLabelText(
      t('reservations.roomMove.targetRoom'),
    );
    expect(select).toHaveTextContent('102 · Deluxe');
    expect(select).not.toHaveTextContent('201');

    await userEvent.selectOptions(select, 'room-2');
    await userEvent.type(
      screen.getByLabelText(t('reservations.roomMove.reason')),
      'Upgrade',
    );
    await userEvent.click(
      screen.getByRole('button', { name: t('reservations.roomMove.submit') }),
    );

    await waitFor(() => {
      expect(reservationsAPI.moveRoom).toHaveBeenCalledWith('res-1', {
        toRoomId: 'room-2',
        reason: 'Upgrade',
        movedBy: 'usr_mock_1',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(
      t('reservations.roomMove.success'),
    );
    expect(onMoved).toHaveBeenCalled();
  });

  it('shows move history', async () => {
    vi.mocked(reservationsAPI.listRoomMoves).mockResolvedValue([
      {
        id: 'move-1',
        reservationId: 'res-1',
        fromRoomId: 'room-1',
        toRoomId: 'room-2',
        reason: 'Noise',
        movedAt: '2026-08-15T10:00:00.000Z',
        movedBy: 'usr_mock_1',
        keyCardReissued: true,
        folioTransferred: true,
        fromRoom: { id: 'room-1', number: '101' },
        toRoom: { id: 'room-2', number: '102' },
      },
    ]);

    renderPanel(<RoomMovePanel reservation={reservation} onMoved={vi.fn()} />);

    expect(
      await screen.findByText(/101/, { selector: 'li' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Noise/)).toBeInTheDocument();
  });

  it('toasts an error when the move fails', async () => {
    vi.mocked(reservationsAPI.moveRoom).mockRejectedValue(
      new Error('Room is not available'),
    );
    renderPanel(<RoomMovePanel reservation={reservation} onMoved={vi.fn()} />);

    await userEvent.selectOptions(
      await screen.findByLabelText(t('reservations.roomMove.targetRoom')),
      'room-2',
    );
    await userEvent.click(
      screen.getByRole('button', { name: t('reservations.roomMove.submit') }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Room is not available');
    });
  });
});
