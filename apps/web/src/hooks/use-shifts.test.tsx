import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useApproveShift,
  useCloseShift,
  useCurrentShift,
  useHandoverShift,
  useOpenShift,
  useShift,
  useTodayShifts,
} from './use-shifts';
import { shiftsAPI } from '@/lib/api/shifts';

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

const mockShift = {
  id: 'sh_1',
  status: 'OPEN' as const,
  propertyId: 'prop_1',
  userId: 'usr_1',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';
  return { Wrapper, queryClient };
}

describe('use-shifts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches today shifts with the list query key', async () => {
    vi.mocked(shiftsAPI.list).mockResolvedValue([mockShift] as never);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(
      () => useTodayShifts('prop_1', '2026-08-14'),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(shiftsAPI.list).toHaveBeenCalledWith('prop_1', '2026-08-14');
    expect(result.current.data).toEqual([mockShift]);
  });

  it('does not fetch today shifts without a property', () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useTodayShifts(), {
      wrapper: Wrapper,
    });
    expect(result.current.isFetching).toBe(false);
    expect(shiftsAPI.list).not.toHaveBeenCalled();
  });

  it('fetches the current shift', async () => {
    vi.mocked(shiftsAPI.getCurrent).mockResolvedValue(mockShift as never);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCurrentShift('prop_1', 'usr_1'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(shiftsAPI.getCurrent).toHaveBeenCalledWith('prop_1', 'usr_1');
  });

  it('fetches a shift by id', async () => {
    vi.mocked(shiftsAPI.getById).mockResolvedValue(mockShift as never);
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useShift('sh_1'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(shiftsAPI.getById).toHaveBeenCalledWith('sh_1');
  });

  it('invalidates shift queries after open', async () => {
    vi.mocked(shiftsAPI.open).mockResolvedValue(mockShift as never);
    const { Wrapper, queryClient } = createWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useOpenShift(), { wrapper: Wrapper });

    await result.current.mutateAsync({
      propertyId: 'prop_1',
      userId: 'usr_1',
      openingCash: 100,
    });

    expect(spy).toHaveBeenCalledWith({ queryKey: ['shifts'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['shifts', 'current'] });
  });

  it('invalidates shift queries after close, approve, and handover', async () => {
    vi.mocked(shiftsAPI.close).mockResolvedValue(mockShift as never);
    vi.mocked(shiftsAPI.approve).mockResolvedValue(mockShift as never);
    vi.mocked(shiftsAPI.handover).mockResolvedValue({
      closed: mockShift,
      opened: mockShift,
    } as never);

    const { Wrapper, queryClient } = createWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    const close = renderHook(() => useCloseShift(), { wrapper: Wrapper });
    await close.result.current.mutateAsync({
      id: 'sh_1',
      data: { closingCash: 100, userId: 'usr_1' },
    });

    const approve = renderHook(() => useApproveShift(), { wrapper: Wrapper });
    await approve.result.current.mutateAsync({
      id: 'sh_1',
      data: { userId: 'mgr_1' },
    });

    const handover = renderHook(() => useHandoverShift(), {
      wrapper: Wrapper,
    });
    await handover.result.current.mutateAsync({
      id: 'sh_1',
      data: { toUserId: 'usr_2', countedCash: 100, userId: 'usr_1' },
    });

    expect(spy).toHaveBeenCalledWith({ queryKey: ['shifts'] });
  });
});
