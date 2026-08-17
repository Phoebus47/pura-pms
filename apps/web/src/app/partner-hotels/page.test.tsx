import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PartnerHotelsPage from './page';
import { partnerHotelsAPI } from '@/lib/api/partner-hotels';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/partner-hotels',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/partner-hotels', () => ({
  partnerHotelsAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PartnerHotelsPage />
    </QueryClientProvider>,
  );
}

describe('PartnerHotelsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(partnerHotelsAPI.getAll).mockResolvedValue([]);
  });

  it('renders the title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('partnerHotels.title') }),
    ).toBeInTheDocument();
  });

  it('renders the create form and empty list', async () => {
    renderPage();
    expect(
      await screen.findByLabelText(t('partnerHotels.name')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('partnerHotels.createSubmit') }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(t('partnerHotels.empty')),
    ).toBeInTheDocument();
  });

  it('creates a partner hotel and shows it in the list', async () => {
    vi.mocked(partnerHotelsAPI.create).mockResolvedValue({
      id: 'ph-1',
      propertyId: 'prop_1',
      name: 'Grand Partner Hotel',
      isActive: true,
      createdAt: '2026-08-17',
      updatedAt: '2026-08-17',
    });
    renderPage();

    const nameInput = await screen.findByLabelText(t('partnerHotels.name'));
    await userEvent.type(nameInput, 'Grand Partner Hotel');
    fireEvent.submit(nameInput.closest('form')!);

    await waitFor(() => {
      expect(partnerHotelsAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'prop_1',
          name: 'Grand Partner Hotel',
        }),
      );
    });
  });

  it('toggles a partner hotel active state', async () => {
    vi.mocked(partnerHotelsAPI.getAll).mockResolvedValue([
      {
        id: 'ph-1',
        propertyId: 'prop_1',
        name: 'Grand Partner Hotel',
        isActive: true,
        createdAt: '2026-08-17',
        updatedAt: '2026-08-17',
      },
    ]);
    vi.mocked(partnerHotelsAPI.update).mockResolvedValue({
      id: 'ph-1',
      propertyId: 'prop_1',
      name: 'Grand Partner Hotel',
      isActive: false,
      createdAt: '2026-08-17',
      updatedAt: '2026-08-17',
    });
    renderPage();

    const deactivateButton = await screen.findByRole('button', {
      name: t('partnerHotels.deactivate'),
    });
    await userEvent.click(deactivateButton);

    await waitFor(() => {
      expect(partnerHotelsAPI.update).toHaveBeenCalledWith('ph-1', {
        isActive: false,
      });
    });
  });
});
