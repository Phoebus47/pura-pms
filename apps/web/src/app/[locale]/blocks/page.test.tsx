import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BlocksPage from './page';
import { blocksAPI } from '@/lib/api/blocks';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/blocks',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/blocks', () => ({
  blocksAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    getPickup: vi.fn(),
    attach: vi.fn(),
    release: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

vi.mock('@/lib/api/room-types', () => ({
  roomTypesAPI: { getAll: vi.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BlocksPage />
    </QueryClientProvider>,
  );
}

describe('BlocksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(roomTypesAPI.getAll).mockResolvedValue([
      { id: 'rt_1', name: 'Deluxe' },
    ] as never);
    vi.mocked(blocksAPI.getAll).mockResolvedValue([]);
  });

  it('renders the title and create form', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('blocks.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByLabelText(t('blocks.code'))).toBeInTheDocument();
    expect(await screen.findByText(t('blocks.empty'))).toBeInTheDocument();
  });

  it('creates an allotment', async () => {
    vi.mocked(blocksAPI.create).mockResolvedValue({ id: 'block-1' } as never);
    renderPage();
    const codeInput = await screen.findByLabelText(t('blocks.code'));
    fireEvent.change(codeInput, { target: { value: 'OTA-AUG' } });
    fireEvent.change(screen.getByLabelText(t('blocks.name')), {
      target: { value: 'Booking.com' },
    });
    fireEvent.submit(codeInput.closest('form') as HTMLFormElement);
    await waitFor(() => {
      expect(blocksAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'OTA-AUG',
          name: 'Booking.com',
          kind: 'ALLOTMENT',
          propertyId: 'prop_1',
        }),
      );
    });
  });

  it('loads pickup and attaches a reservation', async () => {
    vi.mocked(blocksAPI.getAll).mockResolvedValue([
      {
        id: 'block-1',
        code: 'OTA-AUG',
        name: 'Booking.com',
        status: 'OPEN',
        allottedRooms: 5,
        _count: { reservations: 1 },
      },
    ] as never);
    vi.mocked(blocksAPI.getPickup).mockResolvedValue({
      blockId: 'block-1',
      allottedRooms: 5,
      releasedRooms: 0,
      pickedUp: 1,
      remaining: 4,
      nights: [],
    });
    vi.mocked(blocksAPI.attach).mockResolvedValue({
      remaining: 3,
    } as never);
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /OTA-AUG/ }));
    const reservationInput = await screen.findByLabelText(
      t('blocks.reservationId'),
    );
    fireEvent.change(reservationInput, { target: { value: 'res-1' } });
    fireEvent.click(screen.getByRole('button', { name: t('blocks.attach') }));
    await waitFor(() => {
      expect(blocksAPI.attach).toHaveBeenCalledWith('block-1', 'res-1');
    });
  });
});
