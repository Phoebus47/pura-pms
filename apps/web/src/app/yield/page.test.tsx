import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import YieldPage from './page';
import { yieldAPI } from '@/lib/api/yield';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/yield',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/yield', () => ({
  yieldAPI: {
    getPace: vi.fn(),
    getRecommendations: vi.fn(),
    generateRecommendations: vi.fn(),
    applyRecommendation: vi.fn(),
    dismissRecommendation: vi.fn(),
    getCompetitors: vi.fn(),
    createCompetitor: vi.fn(),
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
      <YieldPage />
    </QueryClientProvider>,
  );
}

describe('YieldPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(roomTypesAPI.getAll).mockResolvedValue([
      { id: 'rt_1', name: 'Deluxe' },
    ] as never);
    vi.mocked(yieldAPI.getPace).mockResolvedValue({
      from: '2026-08-18',
      to: '2026-08-18',
      days: [
        {
          stayDate: '2026-08-18',
          lastYearDate: '2025-08-19',
          capacity: 10,
          occupied: 3,
          occupancyPct: 30,
          lastYearOccupied: 8,
          lastYearOccupancyPct: 80,
          paceDeltaPct: -50,
          alert: true,
        },
      ],
    });
    vi.mocked(yieldAPI.getRecommendations).mockResolvedValue([]);
    vi.mocked(yieldAPI.getCompetitors).mockResolvedValue([]);
  });

  it('renders the title and pace table', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('yield.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText('2026-08-18')).toBeInTheDocument();
    expect(
      screen.getByText(t('yield.paceAlert'), { exact: false }),
    ).toBeInTheDocument();
  });

  it('generates recommendations', async () => {
    vi.mocked(yieldAPI.generateRecommendations).mockResolvedValue([]);
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: t('yield.generate') }),
    );
    await waitFor(() => {
      expect(yieldAPI.generateRecommendations).toHaveBeenCalledWith('prop_1');
    });
  });

  it('creates a competitor rate', async () => {
    vi.mocked(yieldAPI.createCompetitor).mockResolvedValue({
      id: 'comp-1',
    } as never);
    renderPage();
    const nameInput = await screen.findByLabelText(t('yield.competitorName'));
    fireEvent.change(nameInput, { target: { value: 'Hotel B' } });
    fireEvent.change(screen.getByLabelText(t('yield.competitorAmount')), {
      target: { value: '900' },
    });
    fireEvent.submit(nameInput.closest('form') as HTMLFormElement);
    await waitFor(() => {
      expect(yieldAPI.createCompetitor).toHaveBeenCalledWith(
        expect.objectContaining({
          competitorName: 'Hotel B',
          amount: 900,
          propertyId: 'prop_1',
        }),
      );
    });
  });

  it('applies a pending recommendation', async () => {
    vi.mocked(yieldAPI.getRecommendations).mockResolvedValue([
      {
        id: 'rec-1',
        propertyId: 'prop_1',
        roomTypeId: 'rt_1',
        rateId: 'rate-bar',
        stayDate: '2026-08-20',
        currentAmount: 1000,
        recommendedAmount: 1100,
        occupancyPct: 90,
        paceDeltaPct: 10,
        competitorAmount: null,
        reason: 'HIGH_DEMAND',
        status: 'PENDING',
        rate: { id: 'rate-bar', code: 'BAR', name: 'Best Available' },
      },
    ]);
    vi.mocked(yieldAPI.applyRecommendation).mockResolvedValue({
      id: 'rec-1',
      status: 'APPLIED',
    } as never);
    renderPage();
    fireEvent.click(
      await screen.findByRole('button', { name: t('yield.apply') }),
    );
    await waitFor(() => {
      expect(yieldAPI.applyRecommendation).toHaveBeenCalledWith('rec-1');
    });
  });
});
