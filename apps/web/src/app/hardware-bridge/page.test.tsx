import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HardwareBridgePage from './page';
import { hardwareBridgeAPI } from '@/lib/api/hardware-bridge';
import { propertiesAPI } from '@/lib/api/properties';
import { t } from '@/lib/i18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => '/hardware-bridge',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/local-bridge', () => ({
  DEFAULT_AGENT_URL: 'http://127.0.0.1:9247',
  localBridge: {
    health: vi.fn().mockResolvedValue({ ok: false }),
    print: vi.fn(),
    encodeKeyCard: vi.fn(),
    scanPassport: vi.fn(),
    scanThaiId: vi.fn(),
  },
}));

vi.mock('@/lib/api/hardware-bridge', () => ({
  hardwareBridgeAPI: {
    getCatalog: vi.fn(),
    listAgents: vi.fn(),
    registerAgent: vi.fn(),
    heartbeat: vi.fn(),
    listJobs: vi.fn(),
    createJob: vi.fn(),
    completeJob: vi.fn(),
    failJob: vi.fn(),
    simulateJob: vi.fn(),
  },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HardwareBridgePage />
    </QueryClientProvider>,
  );
}

describe('HardwareBridgePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(propertiesAPI.getAll).mockResolvedValue([
      { id: 'prop_1' },
    ] as never);
    vi.mocked(hardwareBridgeAPI.listAgents).mockResolvedValue([]);
    vi.mocked(hardwareBridgeAPI.listJobs).mockResolvedValue([]);
  });

  it('renders the title', async () => {
    renderPage();
    expect(
      await screen.findByRole('heading', { name: t('hardwareBridge.title') }),
    ).toBeInTheDocument();
  });

  it('registers an agent', async () => {
    vi.mocked(hardwareBridgeAPI.registerAgent).mockResolvedValue({
      id: 'agent-1',
      propertyId: 'prop_1',
      name: 'Desk PC',
      machineId: 'fd-01',
      isActive: true,
      lastSeenAt: new Date().toISOString(),
    });
    renderPage();
    fireEvent.change(await screen.findByLabelText(t('hardwareBridge.name')), {
      target: { value: 'Desk PC' },
    });
    fireEvent.change(screen.getByLabelText(t('hardwareBridge.machineId')), {
      target: { value: 'fd-01' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: t('hardwareBridge.register') }),
    );
    await waitFor(() => {
      expect(hardwareBridgeAPI.registerAgent).toHaveBeenCalledWith({
        propertyId: 'prop_1',
        name: 'Desk PC',
        machineId: 'fd-01',
      });
    });
  });

  it('simulates a print job', async () => {
    vi.mocked(hardwareBridgeAPI.createJob).mockResolvedValue({
      id: 'job-1',
      propertyId: 'prop_1',
      type: 'PRINT',
      status: 'PENDING',
      requestedBy: 'front-desk',
      payload: { jobType: 'receipt' },
      createdAt: new Date().toISOString(),
    });
    vi.mocked(hardwareBridgeAPI.simulateJob).mockResolvedValue({
      id: 'job-1',
      propertyId: 'prop_1',
      type: 'PRINT',
      status: 'COMPLETED',
      requestedBy: 'front-desk',
      payload: { jobType: 'receipt' },
      createdAt: new Date().toISOString(),
    });
    renderPage();
    const printHeading = await screen.findByRole('heading', {
      name: t('hardwareBridge.testPrint'),
    });
    const section = printHeading.closest('section');
    expect(section).not.toBeNull();
    fireEvent.click(
      within(section as HTMLElement).getByRole('button', {
        name: t('hardwareBridge.simulate'),
      }),
    );
    await waitFor(() => {
      expect(hardwareBridgeAPI.createJob).toHaveBeenCalledWith(
        expect.objectContaining({
          propertyId: 'prop_1',
          type: 'PRINT',
          payload: { jobType: 'receipt' },
        }),
      );
      expect(hardwareBridgeAPI.simulateJob).toHaveBeenCalledWith('job-1');
    });
  });
});
