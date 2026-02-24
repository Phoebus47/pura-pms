/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useQueryGuests, useQueryGuest } from './use-query-guests';
import { apiClient } from '@/lib/api/client';
import type { Guest } from '@/lib/api';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientWrapper';

  return Wrapper;
};

describe('useQueryGuests', () => {
  const mockGuests: Guest[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+66123456789',
      nationality: 'US',
      idNumber: '',
      address: '',
      vipLevel: 0,
      isBlacklist: false,
      totalStays: 0,
      totalRevenue: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch guests successfully', async () => {
    (apiClient.get as any).mockResolvedValue(mockGuests);

    const { result } = renderHook(() => useQueryGuests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGuests);
    expect(apiClient.get).toHaveBeenCalledWith('/guests');
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch guests';
    (apiClient.get as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useQueryGuests(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useQueryGuest', () => {
  const mockGuest: Guest = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+66123456789',
    nationality: 'US',
    idNumber: '',
    address: '',
    vipLevel: 0,
    isBlacklist: false,
    totalStays: 0,
    totalRevenue: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch guest by id successfully', async () => {
    (apiClient.get as any).mockResolvedValue(mockGuest);

    const { result } = renderHook(() => useQueryGuest('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockGuest);
    expect(apiClient.get).toHaveBeenCalledWith('/guests/1');
  });

  it('should not fetch when id is empty', () => {
    const { result } = renderHook(() => useQueryGuest(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    const errorMessage = 'Failed to fetch guest';
    (apiClient.get as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useQueryGuest('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
