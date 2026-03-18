import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import NightAuditPage from './page';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';
import { nightAuditAPI } from '@/lib/api/night-audit';

import { propertiesAPI } from '@/lib/api/properties';

type QueryOptions = {
  queryKey: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  refetchInterval?: (query: unknown) => number | false;
};

type MutationOptions = {
  mutationFn?: () => Promise<unknown>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
};

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/lib/api/night-audit', () => ({
  nightAuditAPI: { start: vi.fn(), getStatus: vi.fn() },
}));

vi.mock('@/lib/api/properties', () => ({
  propertiesAPI: { getAll: vi.fn() },
}));

vi.mock('@tanstack/react-query', () => {
  return {
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

describe('NightAuditPage', () => {
  const mockInvalidateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    } as unknown as ReturnType<typeof useQueryClient>);
  });

  it('renders loading state initially when property is undefined', () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    render(<NightAuditPage />);
    expect(screen.getByText(/Loading property settings/i)).toBeInTheDocument();
  });

  it('renders PENDING status and Run button when ready', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'PENDING' },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('Current Run Status')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Run Night Audit/i }),
    ).toBeInTheDocument();
  });

  it('renders IN_PROGRESS status without Run button', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'IN_PROGRESS', roomsPosted: 10, revenuePosted: 5000 },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    expect(screen.getByText(/Audit in Progress/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Run Night Audit/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });

  it('renders COMPLETED status with startedAt and completedAt', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: {
          status: 'COMPLETED',
          startedAt: '2025-01-15T01:00:00Z',
          completedAt: '2025-01-15T02:00:00Z',
        },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    expect(
      screen.getByText(/Night Audit Completed Successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Completed for Today/i)).toBeInTheDocument();
    // These ensure the true branches of the ternaries are hit
    expect(
      screen.getByText(new Date('2025-01-15T01:00:00Z').toLocaleTimeString()),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new Date('2025-01-15T02:00:00Z').toLocaleTimeString()),
    ).toBeInTheDocument();
  });

  it('renders FAILED status with errors and allows Run Audit', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: {
          status: 'FAILED',
          errors: [
            {
              id: 'err-1',
              errorType: 'TEST_ERROR',
              description: 'Test error message',
            },
          ],
        },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    expect(screen.getByText(/Night Audit Failed/i)).toBeInTheDocument();
    expect(screen.getByText('TEST_ERROR')).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Run Night Audit/i }),
    ).toBeInTheDocument();
  });

  it('triggers mutation when Run Audit button is clicked', async () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'PENDING' },
      } as unknown as ReturnType<typeof useQuery>;
    });

    const mutateMock = vi.fn();
    vi.mocked(useMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    fireEvent.click(screen.getByRole('button', { name: /Run Night Audit/i }));

    expect(mutateMock).toHaveBeenCalled();
  });

  it('renders reports list when available', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: {
          status: 'COMPLETED',
          reports: [{ id: 'rep-1', reportName: 'Night Audit Summary Report' }],
        },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);

    expect(screen.getByText('Night Audit Summary Report')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
  });

  it('computes refetchInterval correctly based on IN_PROGRESS status', async () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'PENDING' },
      } as unknown as ReturnType<typeof useQuery>;
    });

    render(<NightAuditPage />);
    const useQueryCalls = vi.mocked(useQuery).mock.calls;
    const auditStatusCall = useQueryCalls.find(
      (call) => (call[0] as QueryOptions).queryKey[0] === 'night-audit-status',
    );
    const options = (auditStatusCall?.[0] ?? {}) as QueryOptions;

    expect(
      options.refetchInterval({ state: { data: { status: 'IN_PROGRESS' } } }),
    ).toBe(3000);
    expect(
      options.refetchInterval({ state: { data: { status: 'COMPLETED' } } }),
    ).toBe(false);
    expect(options.refetchInterval({})).toBe(false);

    // Also test queryFn branch
    vi.mocked(nightAuditAPI.getStatus).mockResolvedValue({
      status: 'PENDING',
    } as unknown as never);
    await options.queryFn?.();
    expect(nightAuditAPI.getStatus).toHaveBeenCalledWith(
      'prop-1',
      '2025-01-15T00:00:00.000Z',
    );
  });

  it('handles mutation callbacks correctly mapping onSuccess and onError', async () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            {
              id: 'prop-1',
              name: 'Test Property',
              businessDate: '2025-01-15T00:00:00.000Z',
            },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'PENDING' },
      } as unknown as ReturnType<typeof useQuery>;
    });

    render(<NightAuditPage />);
    const useMutationCall = vi.mocked(useMutation).mock.calls[0] ?? [];
    const options = (useMutationCall[0] ?? {}) as MutationOptions;

    options.onSuccess?.();
    expect(toast.success).toHaveBeenCalledWith(
      'Night Audit started successfully',
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['night-audit-status'],
    });

    options.onError?.(new Error('Test mutation error'));
    expect(toast.error).toHaveBeenCalledWith(
      'Failed to start Night Audit: Test mutation error',
    );

    vi.mocked(nightAuditAPI.start).mockResolvedValue({
      status: 'STARTED',
    } as unknown as never);
    await options.mutationFn?.();
    expect(nightAuditAPI.start).toHaveBeenCalledWith(
      'prop-1',
      '2025-01-15T00:00:00.000Z',
    );
  });

  it('renders correctly when status data is completely undefined', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [{ id: 'prop-1', name: 'Test Property' }],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: undefined,
      } as unknown as ReturnType<typeof useQuery>; // Triggers status?.status || 'PENDING'
    });
    render(<NightAuditPage />);

    // Default PENDING badge
    expect(screen.getByText('PENDING')).toBeInTheDocument();
  });

  it('renders Starting... when mutation is pending', () => {
    vi.mocked(useQuery).mockImplementation((opts: QueryOptions) => {
      if (opts.queryKey[0] === 'properties') {
        return {
          data: [
            { id: 'prop-1', name: 'Test Property', businessDate: '2025-01-15' },
          ],
        } as unknown as ReturnType<typeof useQuery>;
      }
      return {
        data: { status: 'PENDING' },
      } as unknown as ReturnType<typeof useQuery>;
    });

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useMutation>);

    render(<NightAuditPage />);
    expect(
      screen.getByRole('button', { name: /Starting.../i }),
    ).toBeInTheDocument();
  });

  it('calls propertiesAPI.getAll in queryFn', async () => {
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useQuery>);
    render(<NightAuditPage />);

    const propCall = vi
      .mocked(useQuery)
      .mock.calls.find(
        (call) => (call[0] as QueryOptions).queryKey[0] === 'properties',
      );
    const options = (propCall?.[0] ?? {}) as QueryOptions;

    vi.mocked(propertiesAPI.getAll).mockResolvedValue([] as unknown as never);
    await options.queryFn?.();
    expect(propertiesAPI.getAll).toHaveBeenCalled();
  });
});
