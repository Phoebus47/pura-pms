import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegistrationCardSignPage from './page';
import { registrationCardsAPI } from '@/lib/api/registration-cards';
import { t } from '@/lib/i18n';
import { toast } from '@/lib/toast';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'rc_1' }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/registration-cards/rc_1/sign',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RegistrationCardSignPage />
    </QueryClientProvider>,
  );
}

const draftCard = {
  id: 'rc_1',
  propertyId: 'prop_1',
  reservationId: 'res_1',
  version: 1,
  status: 'DRAFT' as const,
  guestSnapshot: {
    firstName: 'Ann',
    lastName: 'Guest',
    email: null,
    phone: null,
    idType: null,
    idNumber: null,
    nationality: null,
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
    rateCode: null,
    roomRate: 2500,
  },
  propertySnapshot: {
    name: 'Pura',
    address: null,
    phone: null,
    taxId: null,
  },
  signatureData: null,
  signedAt: null,
  signedByGuestName: null,
  voidReason: null,
  voidedAt: null,
  voidedBy: null,
  createdBy: 'user-1',
  createdAt: '2026-08-18T09:00:00.000Z',
  updatedAt: '2026-08-18T09:00:00.000Z',
};

describe('RegistrationCardSignPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(registrationCardsAPI.getById).mockResolvedValue(draftCard);
  });

  it('renders sign form', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', {
        name: t('registrationCard.signTitle'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(t('registrationCard.guestName')),
    ).toBeInTheDocument();
  });

  it('shows signature required when submitting empty pad', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', {
      name: t('registrationCard.signTitle'),
    });
    await user.click(
      screen.getByRole('button', { name: t('registrationCard.submit') }),
    );
    expect(toast.error).toHaveBeenCalledWith(
      t('registrationCard.signatureRequired'),
    );
  });
});
