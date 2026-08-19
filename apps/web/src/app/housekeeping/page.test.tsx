import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HousekeepingPage from './page';
import { housekeepingAPI } from '@/lib/api/housekeeping';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/housekeeping',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/housekeeping', () => ({
  housekeepingAPI: {
    getBoard: vi.fn(),
    getChecklist: vi.fn(),
    markClean: vi.fn(),
    setGuestRequest: vi.fn(),
    inspect: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

vi.mock('@/lib/stores/use-auth-store', () => ({
  useAuthStore: (selector: (state: { user: { id: string } }) => unknown) =>
    selector({ user: { id: 'usr_mock_1' } }),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HousekeepingPage />
    </QueryClientProvider>,
  );
}

describe('HousekeepingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(housekeepingAPI.getChecklist).mockResolvedValue([
      { code: 'BED', required: true },
      { code: 'BATH', required: true },
      { code: 'LINEN', required: true },
      { code: 'AMENITIES', required: true },
      { code: 'MINIBAR', required: false },
    ]);
    vi.mocked(housekeepingAPI.getBoard).mockResolvedValue([]);
  });

  it('renders the title and empty board', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('housekeeping.title') }),
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText(t('housekeeping.empty'))).length,
    ).toBeGreaterThan(0);
  });

  it('marks a dirty room clean', async () => {
    vi.mocked(housekeepingAPI.getBoard).mockResolvedValue([
      {
        id: 'room-1',
        number: '101',
        status: 'VACANT_DIRTY',
        hkStage: 'DIRTY',
        guestRequest: 'NONE',
        propertyId: 'prop_1',
        roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
      },
    ] as never);
    vi.mocked(housekeepingAPI.markClean).mockResolvedValue({
      id: 'room-1',
    } as never);
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: t('housekeeping.markClean') }),
    );
    await waitFor(() => {
      expect(housekeepingAPI.markClean).toHaveBeenCalledWith('room-1');
    });
  });

  it('sets DND on a room', async () => {
    vi.mocked(housekeepingAPI.getBoard).mockResolvedValue([
      {
        id: 'room-1',
        number: '101',
        status: 'OCCUPIED_CLEAN',
        hkStage: 'READY',
        guestRequest: 'NONE',
        propertyId: 'prop_1',
        roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
      },
    ] as never);
    vi.mocked(housekeepingAPI.setGuestRequest).mockResolvedValue({
      id: 'room-1',
      guestRequest: 'DND',
    } as never);
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: t('housekeeping.setDnd') }),
    );
    await waitFor(() => {
      expect(housekeepingAPI.setGuestRequest).toHaveBeenCalledWith(
        'room-1',
        expect.objectContaining({ request: 'DND', updatedBy: 'usr_mock_1' }),
      );
    });
  });

  it('submits an inspection for a cleaned room', async () => {
    vi.mocked(housekeepingAPI.getBoard).mockResolvedValue([
      {
        id: 'room-1',
        number: '101',
        status: 'VACANT_CLEAN',
        hkStage: 'CLEAN',
        propertyId: 'prop_1',
        roomType: { id: 'rt-1', name: 'Deluxe', code: 'DLX' },
      },
    ] as never);
    vi.mocked(housekeepingAPI.inspect).mockResolvedValue({});
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /101/ }));
    expect(await screen.findByLabelText(/Bed made/)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {
        name: t('housekeeping.inspectSubmit'),
      }),
    );
    await waitFor(() => {
      expect(housekeepingAPI.inspect).toHaveBeenCalledWith(
        'room-1',
        expect.objectContaining({
          lines: expect.arrayContaining([
            expect.objectContaining({ itemCode: 'BED', passed: true }),
          ]),
        }),
      );
    });
  });
});
