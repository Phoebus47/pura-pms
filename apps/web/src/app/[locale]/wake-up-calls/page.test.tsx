import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WakeUpCallsPage from './page';
import { wakeUpCallsAPI } from '@/lib/api/wake-up-calls';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/wake-up-calls', () => ({
  wakeUpCallsAPI: {
    list: vi.fn(),
    create: vi.fn(),
    complete: vi.fn(),
    miss: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
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
      <WakeUpCallsPage />
    </QueryClientProvider>,
  );
}

describe('WakeUpCallsPage', () => {
  it('renders wake-up board title and a scheduled call', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      {
        id: 'prop_1',
        name: 'Pura',
        businessDate: '2026-08-19',
      } as never,
    ]);
    vi.mocked(wakeUpCallsAPI.list).mockResolvedValue([
      {
        id: 'wu_1',
        propertyId: 'prop_1',
        reservationId: 'res_1',
        roomId: 'room_1',
        scheduledAt: '2026-08-19T06:00:00.000Z',
        scheduledDate: '2026-08-19',
        status: 'SCHEDULED',
        notes: null,
        scheduledBy: 'user-1',
        completedAt: null,
        completedBy: null,
        missedAt: null,
        missedBy: null,
        cancelledAt: null,
        cancelledBy: null,
        cancelReason: null,
        createdAt: '2026-08-19T01:00:00.000Z',
        updatedAt: '2026-08-19T01:00:00.000Z',
        room: { id: 'room_1', number: '101' },
        reservation: {
          id: 'res_1',
          confirmNumber: 'CN-1',
          status: 'CHECKED_IN',
          guest: { firstName: 'Ann', lastName: 'Guest' },
        },
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('wakeUpCalls.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Ann Guest/)).toBeInTheDocument();
    expect(screen.getByText(/101/)).toBeInTheDocument();
  });
});
