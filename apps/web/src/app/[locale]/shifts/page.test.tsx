import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShiftsPage from './page';
import { propertiesAPI } from '@/lib/api/properties';
import { shiftsAPI } from '@/lib/api/shifts';
import { toast } from '@/lib/toast';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/shifts',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

vi.mock('@/lib/api/shifts', () => ({
  shiftsAPI: {
    list: vi.fn(),
    getCurrent: vi.fn(),
    getById: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
    approve: vi.fn(),
    handover: vi.fn(),
  },
}));

vi.mock('@/lib/stores/use-auth-store', () => ({
  useAuthStore: (
    selector?: (state: { user: { id: string } | null }) => unknown,
  ) => {
    const state = { user: { id: 'usr_mock_1' } };
    return selector ? selector(state) : state;
  },
}));

const property = {
  id: 'prop_mock_1',
  name: 'Demo Hotel',
  businessDate: '2026-08-14T00:00:00.000Z',
};

const openShift = {
  id: 'sh_1',
  shiftNumber: 'SH-20260814-mock-1',
  userId: 'usr_mock_1',
  propertyId: 'prop_mock_1',
  businessDate: property.businessDate,
  startTime: property.businessDate,
  endTime: null,
  openingCash: 1000,
  closingCash: null,
  expectedCash: 1000,
  cashVariance: null,
  status: 'OPEN' as const,
  closedBy: null,
  managerApprovedBy: null,
  managerApprovedAt: null,
  varianceReason: null,
  handoverToUserId: null,
  handoverFromShiftId: null,
  notes: null,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ShiftsPage />
    </QueryClientProvider>,
  );
}

describe('ShiftsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([property] as never);
    vi.mocked(shiftsAPI.list).mockResolvedValue([]);
    vi.mocked(shiftsAPI.getCurrent).mockResolvedValue(null);
  });

  it('renders the shifts title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { level: 1, name: t('shifts.title') }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(`${t('shifts.property')}: ${property.name}`),
    ).toBeInTheDocument();
  });

  it('renders a labeled open form when there is no current shift', async () => {
    renderPage();
    expect(
      await screen.findByLabelText(t('shifts.openingCash')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('shifts.submitOpen') }),
    ).toBeInTheDocument();
  });

  it('submits an open shift', async () => {
    const user = userEvent.setup();
    vi.mocked(shiftsAPI.open).mockResolvedValue(openShift as never);
    renderPage();

    const input = await screen.findByLabelText(t('shifts.openingCash'));
    await user.clear(input);
    await user.type(input, '2500');
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(shiftsAPI.open).toHaveBeenCalledWith({
        propertyId: 'prop_mock_1',
        userId: 'usr_mock_1',
        openingCash: 2500,
        businessDate: property.businessDate,
      });
      expect(toast.success).toHaveBeenCalledWith(t('shifts.openSuccess'));
    });
  });

  it('shows close and handover controls for an OPEN shift', async () => {
    vi.mocked(shiftsAPI.getCurrent).mockResolvedValue(openShift as never);
    vi.mocked(shiftsAPI.list).mockResolvedValue([openShift] as never);
    renderPage();

    expect(
      await screen.findByLabelText(t('shifts.closingCash')),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('shifts.varianceReason')),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(t('shifts.toUserId'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('shifts.countedCash'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('shifts.submitClose') }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('shifts.submitHandover') }),
    ).toBeInTheDocument();
  });

  it('shows approve when the current shift is CLOSED', async () => {
    vi.mocked(shiftsAPI.getCurrent).mockResolvedValue({
      ...openShift,
      status: 'CLOSED',
    } as never);
    renderPage();

    expect(
      await screen.findByRole('button', { name: t('shifts.submitApprove') }),
    ).toBeInTheDocument();
  });

  it('shows approve on today list after a shift is closed', async () => {
    vi.mocked(shiftsAPI.getCurrent).mockResolvedValue(null);
    vi.mocked(shiftsAPI.list).mockResolvedValue([
      { ...openShift, status: 'CLOSED' as const },
    ] as never);
    renderPage();

    expect(
      await screen.findByRole('button', { name: t('shifts.submitApprove') }),
    ).toBeInTheDocument();
  });
});
