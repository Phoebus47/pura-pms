import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useOpenFolios } from './use-folios';
import { foliosAPI } from '@/lib/api/folios';

vi.mock('@/lib/api/folios', () => ({
  foliosAPI: {
    list: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useOpenFolios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads open folios for a property', async () => {
    vi.mocked(foliosAPI.list).mockResolvedValue([]);

    const { result } = renderHook(() => useOpenFolios('prop-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(foliosAPI.list).toHaveBeenCalledWith({
      propertyId: 'prop-1',
      status: 'OPEN',
    });
  });

  it('does not fetch without a property id', () => {
    const { result } = renderHook(() => useOpenFolios(), {
      wrapper: createWrapper(),
    });
    expect(result.current.fetchStatus).toBe('idle');
    expect(foliosAPI.list).not.toHaveBeenCalled();
  });
});
