import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComplaintsPage from './page';
import { guestComplaintsAPI } from '@/lib/api/guest-complaints';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/guest-complaints', () => ({
  guestComplaintsAPI: {
    list: vi.fn(),
    create: vi.fn(),
    start: vi.fn(),
    resolve: vi.fn(),
    close: vi.fn(),
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
      <ComplaintsPage />
    </QueryClientProvider>,
  );
}

describe('ComplaintsPage', () => {
  it('renders the title and complaint list', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' } as never,
    ]);
    vi.mocked(guestComplaintsAPI.list).mockResolvedValue([
      {
        id: 'gc_1',
        propertyId: 'prop_1',
        guestId: 'gst_1',
        reservationId: null,
        category: 'Room',
        severity: 'HIGH',
        subject: 'Noisy neighbors',
        description: 'Loud music after midnight',
        status: 'OPEN',
        openedBy: 'usr_1',
        assignedTo: null,
        resolutionNote: null,
        resolvedAt: null,
        resolvedBy: null,
        closedAt: null,
        closedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guest: { id: 'gst_1', firstName: 'Alex', lastName: 'Guest' },
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('complaints.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Noisy neighbors/)).toBeInTheDocument();
    expect(screen.getByText(/Alex Guest/)).toBeInTheDocument();
  });
});
