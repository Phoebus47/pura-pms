import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegistrationCardPrintPage from './page';
import { registrationCardsAPI } from '@/lib/api/registration-cards';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'rc_1' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/registration-cards/rc_1/print',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/api/registration-cards', () => ({
  registrationCardsAPI: {
    listByReservation: vi.fn(),
    getById: vi.fn(),
    createDraft: vi.fn(),
    sign: vi.fn(),
    void: vi.fn(),
    createPrintJob: vi.fn(),
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
      <RegistrationCardPrintPage />
    </QueryClientProvider>,
  );
}

describe('RegistrationCardPrintPage', () => {
  it('renders registration card guest name', async () => {
    vi.mocked(registrationCardsAPI.getById).mockResolvedValue({
      id: 'rc_1',
      propertyId: 'prop_1',
      reservationId: 'res_1',
      version: 1,
      status: 'SIGNED',
      guestSnapshot: {
        firstName: 'Ann',
        lastName: 'Guest',
        email: null,
        phone: null,
        idType: 'PASSPORT',
        idNumber: 'P1',
        nationality: 'TH',
        dateOfBirth: null,
        address: null,
      },
      staySnapshot: {
        confirmNumber: 'CN-001',
        checkIn: '2026-08-18T14:00:00.000Z',
        checkOut: '2026-08-20T12:00:00.000Z',
        nights: 2,
        adults: 2,
        children: 0,
        roomNumber: '101',
        roomTypeName: 'Deluxe',
        rateCode: 'BAR',
        roomRate: 2500,
      },
      propertySnapshot: {
        name: 'Pura Hotel',
        address: 'Bangkok',
        phone: '02',
        taxId: '123',
      },
      signatureData: 'data:image/png;base64,abc',
      signedAt: '2026-08-18T10:00:00.000Z',
      signedByGuestName: 'Ann Guest',
      voidReason: null,
      voidedAt: null,
      voidedBy: null,
      createdBy: 'user-1',
      createdAt: '2026-08-18T09:00:00.000Z',
      updatedAt: '2026-08-18T10:00:00.000Z',
    });

    renderPage();

    expect(
      await screen.findByRole('heading', {
        name: t('registrationCard.printTitle'),
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ann Guest')).toBeInTheDocument();
    expect(screen.getByText('CN-001', { exact: false })).toBeInTheDocument();
  });
});
