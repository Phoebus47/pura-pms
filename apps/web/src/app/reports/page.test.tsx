import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportsPage from './page';
import { propertiesAPI } from '@/lib/api/properties';
import { reportsAPI } from '@/lib/api/reports';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

vi.mock('@/lib/api/reports', () => ({
  reportsAPI: {
    getDailyRevenueReport: vi.fn(),
    getDailyFlash: vi.fn(),
    listJournals: vi.fn(),
    postJournals: vi.fn(),
    getTrialBalance: vi.fn(),
  },
}));

const property = {
  id: 'prop_mock_1',
  name: 'Demo Hotel',
  businessDate: '2026-08-14T00:00:00.000Z',
};

const flash = {
  businessDate: '2026-08-14',
  propertyId: 'prop_mock_1',
  occupancy: { totalRooms: 10, occupiedRooms: 1, occupancyRate: 10 },
  arrivals: 2,
  departures: 1,
  stayOvers: 1,
  roomRevenue: 1170,
  totalRevenue: 1404,
};

const report = {
  businessDate: '2026-08-14',
  propertyId: 'prop_mock_1',
  summary: {
    ROOM: { net: 1000, tax: 70, service: 100, total: 1170 },
    SPA: { net: 200, tax: 14, service: 20, total: 234 },
  },
  totalRevenue: 1404,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ReportsPage />
    </QueryClientProvider>,
  );
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([property] as never);
    vi.mocked(reportsAPI.getDailyRevenueReport).mockResolvedValue(report);
    vi.mocked(reportsAPI.getDailyFlash).mockResolvedValue(flash);
    vi.mocked(reportsAPI.listJournals).mockResolvedValue([]);
    vi.mocked(reportsAPI.getTrialBalance).mockResolvedValue({
      businessDate: '2026-08-14',
      propertyId: 'prop_mock_1',
      rows: [],
      totalDebit: 0,
      totalCredit: 0,
    });
  });

  it('renders the daily revenue report', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('reports.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText(t('reports.drrTitle'))).toBeInTheDocument();
    expect(await screen.findByText('ROOM')).toBeInTheDocument();
    expect(screen.getByText('SPA')).toBeInTheDocument();
    expect(screen.getAllByText('1,404.00').length).toBeGreaterThan(0);
  });

  it('renders the daily flash occupancy snapshot', async () => {
    renderPage();

    expect(
      await screen.findByText(t('reports.flashTitle')),
    ).toBeInTheDocument();
    expect(await screen.findByText('10%')).toBeInTheDocument();
    expect(screen.getByText('1 / 10')).toBeInTheDocument();
  });

  it('loads DRR for the selected business date', async () => {
    renderPage();

    const dateInput = await screen.findByLabelText(t('reports.businessDate'));
    fireEvent.change(dateInput, { target: { value: '2026-08-13' } });

    await waitFor(() => {
      expect(reportsAPI.getDailyRevenueReport).toHaveBeenCalledWith(
        'prop_mock_1',
        '2026-08-13',
      );
    });
  });

  it('renders the GL journals panel', async () => {
    renderPage();
    expect(
      await screen.findByText(t('reports.journalsTitle')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('reports.postJournals') }),
    ).toBeInTheDocument();
  });

  it('renders the trial balance panel', async () => {
    renderPage();
    expect(await screen.findByText(t('reports.tbTitle'))).toBeInTheDocument();
  });

  it('shows an empty state when there is no revenue', async () => {
    vi.mocked(reportsAPI.getDailyRevenueReport).mockResolvedValue({
      ...report,
      summary: {},
      totalRevenue: 0,
    });
    renderPage();

    expect(await screen.findByText(t('reports.empty'))).toBeInTheDocument();
  });
});
