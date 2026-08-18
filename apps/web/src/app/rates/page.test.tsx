import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RatesPage from './page';
import { ratesAPI } from '@/lib/api/rates';
import { propertiesAPI } from '@/lib/api/properties';
import { roomTypesAPI } from '@/lib/api/room-types';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/rates',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/rates', () => ({
  ratesAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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
      <RatesPage />
    </QueryClientProvider>,
  );
}

describe('RatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(roomTypesAPI.getAll).mockResolvedValue([
      { id: 'rt_1', name: 'Deluxe', code: 'DLX' },
    ] as never);
    vi.mocked(ratesAPI.getAll).mockResolvedValue([]);
  });

  it('renders the title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('rates.title') }),
    ).toBeInTheDocument();
  });

  it('renders the create form and empty list', async () => {
    renderPage();
    expect(await screen.findByLabelText(t('rates.code'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('rates.createSubmit') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(t('rates.empty'))).toBeInTheDocument();
  });

  it('creates a derived rate from a parent', async () => {
    const user = userEvent.setup();
    vi.mocked(ratesAPI.getAll).mockResolvedValue([
      {
        id: 'rate-bar',
        code: 'BAR',
        name: 'Best Available',
        roomTypeId: 'rt_1',
        propertyId: 'prop_1',
        amount: 1500,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
      },
    ]);
    vi.mocked(ratesAPI.create).mockResolvedValue({
      id: 'rate-corp',
      code: 'CORP',
      name: 'Corporate',
      amount: 1350,
    } as never);

    renderPage();
    const codeInput = await screen.findByLabelText(t('rates.code'));
    const form = codeInput.closest('form');
    if (!form) {
      throw new Error('expected create form');
    }
    await user.type(codeInput, 'CORP');
    await user.type(screen.getByLabelText(t('rates.name')), 'Corporate');
    await user.selectOptions(
      screen.getByLabelText(t('rates.parent')),
      'rate-bar',
    );
    await user.clear(screen.getByLabelText(t('rates.deriveValue')));
    await user.type(screen.getByLabelText(t('rates.deriveValue')), '-10');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(ratesAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CORP',
          parentRateId: 'rate-bar',
          deriveMode: 'PERCENT_OFFSET',
          deriveValue: -10,
        }),
      );
    });
  });

  it('updates a standalone parent amount', async () => {
    vi.mocked(ratesAPI.getAll).mockResolvedValue([
      {
        id: 'rate-bar',
        code: 'BAR',
        name: 'Best Available',
        roomTypeId: 'rt_1',
        propertyId: 'prop_1',
        amount: 1500,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        daysOfWeek: [],
        isActive: true,
      },
    ]);
    vi.mocked(ratesAPI.update).mockResolvedValue({
      id: 'rate-bar',
      amount: 2000,
    } as never);

    renderPage();
    const amountInput = await screen.findByLabelText(t('rates.amount'), {
      selector: '#amount-rate-bar',
    });
    fireEvent.change(amountInput, { target: { value: '2000' } });
    fireEvent.click(
      screen.getByRole('button', { name: t('rates.updateAmount') }),
    );

    await waitFor(() => {
      expect(ratesAPI.update).toHaveBeenCalledWith('rate-bar', {
        amount: 2000,
      });
    });
  });
});
