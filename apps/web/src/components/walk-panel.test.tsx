import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { WalkPanel } from './walk-panel';
import { reservationsAPI, type Reservation } from '@/lib/api';
import { usePartnerHotels } from '@/hooks/use-partner-hotels';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

vi.mock('@/lib/api', () => ({
  reservationsAPI: {
    walk: vi.fn(),
    listWalks: vi.fn(),
  },
}));

vi.mock('@/hooks/use-partner-hotels', () => ({
  usePartnerHotels: vi.fn(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const reservation = {
  id: 'res-1',
  status: 'CONFIRMED',
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

describe('WalkPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePartnerHotels).mockReturnValue({
      data: [
        { id: 'ph-1', name: 'Grand Partner Hotel', isActive: true },
        { id: 'ph-2', name: 'Inactive Hotel', isActive: false },
      ],
    } as never);
    vi.mocked(reservationsAPI.listWalks).mockResolvedValue([]);
  });

  it('lists active partner hotels and submits a walk', async () => {
    vi.mocked(reservationsAPI.walk).mockResolvedValue(reservation);
    const onWalked = vi.fn();
    renderPanel(<WalkPanel reservation={reservation} onWalked={onWalked} />);

    expect(
      await screen.findByRole('option', { name: 'Grand Partner Hotel' }),
    ).toBeInTheDocument();
    const select = screen.getByLabelText(t('reservations.walk.partnerHotel'));
    expect(select).not.toHaveTextContent('Inactive Hotel');

    fireEvent.change(select, { target: { value: 'ph-1' } });
    fireEvent.change(screen.getByLabelText(t('reservations.walk.cost')), {
      target: { value: '1500' },
    });
    fireEvent.change(
      screen.getByLabelText(t('reservations.walk.compensation')),
      { target: { value: '500' } },
    );
    await userEvent.type(
      screen.getByLabelText(t('reservations.walk.reason')),
      'Overbooked',
    );
    fireEvent.submit(select.closest('form')!);

    await waitFor(() => {
      expect(reservationsAPI.walk).toHaveBeenCalledWith('res-1', {
        partnerHotelId: 'ph-1',
        cost: 1500,
        compensationAmount: 500,
        compensationNotes: undefined,
        reason: 'Overbooked',
        walkedBy: 'usr_mock_1',
      });
    });
    expect(toast.success).toHaveBeenCalledWith(t('reservations.walk.success'));
    expect(onWalked).toHaveBeenCalled();
  });

  it('shows walk history', async () => {
    vi.mocked(reservationsAPI.listWalks).mockResolvedValue([
      {
        id: 'walk-1',
        reservationId: 'res-1',
        partnerHotelId: 'ph-1',
        cost: 1500,
        compensationAmount: 500,
        reason: 'Overbooked',
        walkedAt: '2026-08-17T10:00:00.000Z',
        walkedBy: 'usr_mock_1',
        partnerHotel: { id: 'ph-1', name: 'Grand Partner Hotel' },
      },
    ]);

    renderPanel(<WalkPanel reservation={reservation} onWalked={vi.fn()} />);

    expect(
      await screen.findByText(/Grand Partner Hotel/, { selector: 'li' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Overbooked/)).toBeInTheDocument();
  });

  it('toasts an error when the walk fails', async () => {
    vi.mocked(reservationsAPI.walk).mockRejectedValue(
      new Error('Partner hotel is not active'),
    );
    renderPanel(<WalkPanel reservation={reservation} onWalked={vi.fn()} />);

    const select = await screen.findByLabelText(
      t('reservations.walk.partnerHotel'),
    );
    fireEvent.change(select, { target: { value: 'ph-1' } });
    fireEvent.change(screen.getByLabelText(t('reservations.walk.cost')), {
      target: { value: '1000' },
    });
    fireEvent.submit(select.closest('form')!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Partner hotel is not active');
    });
  });

  it('disables submit until a hotel and cost are provided', () => {
    renderPanel(<WalkPanel reservation={reservation} onWalked={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: t('reservations.walk.submit') }),
    ).toBeDisabled();
  });
});
