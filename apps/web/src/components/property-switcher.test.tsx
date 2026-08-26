import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropertySwitcher } from './property-switcher';
import { propertiesAPI, type Property } from '@/lib/api/properties';
import { useUIStore } from '@/lib/stores/use-ui-store';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      label: 'Property',
      select: 'Select property',
      all: 'All properties',
      switch: 'Switch property',
    };
    return map[key] ?? key;
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: {
    getAll: vi.fn(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

const mockProperties: Property[] = [
  {
    id: 'prop-1',
    name: 'PURA Luxury Resort Phuket',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    createdAt: '2026-01-01T00:00:00Z',
    businessDate: '2026-08-24',
  },
  {
    id: 'prop-2',
    name: 'PURA Grand Hotel Bangkok',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    createdAt: '2026-01-01T00:00:00Z',
    businessDate: '2026-08-24',
  },
];

describe('PropertySwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUIStore.setState({ activePropertyId: undefined });
  });

  it('renders property select and options', async () => {
    vi.mocked(propertiesAPI.getAll).mockResolvedValue(mockProperties);
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <PropertySwitcher showLabel />
      </QueryClientProvider>,
    );

    const select = await screen.findByLabelText('Select property');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Property')).toBeInTheDocument();

    expect(
      await screen.findByText('PURA Luxury Resort Phuket (THB)'),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('PURA Grand Hotel Bangkok (THB)'),
    ).toBeInTheDocument();
  });

  it('allows user to switch property and updates store', async () => {
    const user = userEvent.setup();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue(mockProperties);
    const queryClient = createTestQueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <PropertySwitcher />
      </QueryClientProvider>,
    );

    const select = await screen.findByLabelText('Select property');
    expect(select).toBeInTheDocument();

    await screen.findByText('PURA Grand Hotel Bangkok (THB)');

    await user.selectOptions(select, 'prop-2');
    expect(useUIStore.getState().activePropertyId).toBe('prop-2');
  });
});
