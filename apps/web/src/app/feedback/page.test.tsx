import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeedbackPage from './page';
import { guestFeedbackAPI } from '@/lib/api/guest-feedback';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/guest-feedback', () => ({
  guestFeedbackAPI: {
    list: vi.fn(),
    create: vi.fn(),
    review: vi.fn(),
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
      <FeedbackPage />
    </QueryClientProvider>,
  );
}

describe('FeedbackPage', () => {
  it('renders the title and feedback entry', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' } as never,
    ]);
    vi.mocked(guestFeedbackAPI.list).mockResolvedValue([
      {
        id: 'fb_1',
        propertyId: 'prop_1',
        guestId: 'gst_1',
        reservationId: null,
        score: 5,
        comment: 'Wonderful stay',
        status: 'OPEN',
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guest: { id: 'gst_1', firstName: 'Sam', lastName: 'Guest' },
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('feedback.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Wonderful stay/)).toBeInTheDocument();
    expect(screen.getByText(/Sam Guest/)).toBeInTheDocument();
  });
});
