import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MessagesPage from './page';
import { guestMessagesAPI } from '@/lib/api/guest-messages';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('@/lib/api/guest-messages', () => ({
  guestMessagesAPI: {
    list: vi.fn(),
    create: vi.fn(),
    markRead: vi.fn(),
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
      <MessagesPage />
    </QueryClientProvider>,
  );
}

describe('MessagesPage', () => {
  it('renders the title and a message', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' } as never,
    ]);
    vi.mocked(guestMessagesAPI.list).mockResolvedValue([
      {
        id: 'msg_1',
        propertyId: 'prop_1',
        guestId: 'gst_1',
        reservationId: null,
        direction: 'INBOUND',
        channel: 'IN_APP',
        content: 'Need extra towels',
        sentBy: null,
        readAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guest: { id: 'gst_1', firstName: 'Ann', lastName: 'Guest' },
      },
    ]);

    renderPage();

    expect(
      await screen.findByRole('heading', { name: t('messages.title') }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Need extra towels/)).toBeInTheDocument();
    expect(screen.getByText(/Ann Guest/)).toBeInTheDocument();
  });
});
