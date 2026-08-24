import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Tm30Page from './page';
import { tm30ReportsAPI } from '@/lib/api/tm30-reports';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/tm30-reports', () => ({
  tm30ReportsAPI: {
    list: vi.fn(),
    generate: vi.fn(),
    exportTsv: vi.fn(),
    submit: vi.fn(),
    confirm: vi.fn(),
    fail: vi.fn(),
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
      <Tm30Page />
    </QueryClientProvider>,
  );
}

describe('Tm30Page', () => {
  it('renders the TM.30 title and a pending guest', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' } as never,
    ]);
    vi.mocked(tm30ReportsAPI.list).mockResolvedValue([
      {
        id: 'tm_1',
        propertyId: 'prop_1',
        reservationId: 'res_1',
        guestId: 'gst_1',
        passportNumber: 'P123',
        fullName: 'Ann Guest',
        nationality: 'US',
        dateOfBirth: '1990-01-01',
        roomNumber: '101',
        arrivalDate: '2026-08-20',
        departureDate: '2026-08-22',
        addressInThailand: 'Bangkok',
        status: 'PENDING',
        dueAt: new Date(Date.now() + 60_000).toISOString(),
        submittedAt: null,
        confirmedAt: null,
        failedAt: null,
        failureReason: null,
        referenceNo: null,
        generatedBy: 'usr_1',
        submittedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('tm30.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Ann Guest/)).toBeInTheDocument();
    expect(screen.getByText(/101/)).toBeInTheDocument();
  });
});
