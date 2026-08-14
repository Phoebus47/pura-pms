import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shiftsAPI } from './shifts';
import { apiClient, getAuthToken, APIError } from './client';

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>();
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
    },
    getAuthToken: vi.fn(),
  };
});

const mockShift = {
  id: 'sh_1',
  shiftNumber: 'SH-20260814-mock-1',
  userId: 'usr_mock_1',
  propertyId: 'prop_mock_1',
  businessDate: '2026-08-14T00:00:00.000Z',
  startTime: '2026-08-14T08:00:00.000Z',
  endTime: null,
  openingCash: 1000,
  closingCash: null,
  expectedCash: 1000,
  cashVariance: null,
  status: 'OPEN' as const,
  closedBy: null,
  managerApprovedBy: null,
  managerApprovedAt: null,
  varianceReason: null,
  handoverToUserId: null,
  handoverFromShiftId: null,
  notes: null,
};

describe('shiftsAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAuthToken).mockReturnValue('token123');
  });

  it('opens a shift via POST /shifts', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(mockShift);

    const payload = {
      propertyId: 'prop_mock_1',
      userId: 'usr_mock_1',
      openingCash: 1000,
    };
    const result = await shiftsAPI.open(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/shifts', payload, 'token123');
    expect(result).toEqual(mockShift);
  });

  it('passes undefined token when unauthenticated', async () => {
    vi.mocked(getAuthToken).mockReturnValue(null);
    vi.mocked(apiClient.post).mockResolvedValue(mockShift);

    await shiftsAPI.open({
      propertyId: 'prop_mock_1',
      userId: 'usr_mock_1',
      openingCash: 0,
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      '/shifts',
      expect.any(Object),
      undefined,
    );
  });

  it('getCurrent returns the OPEN shift', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockShift);

    const result = await shiftsAPI.getCurrent('prop_mock_1', 'usr_mock_1');

    expect(apiClient.get).toHaveBeenCalledWith(
      '/shifts/current?propertyId=prop_mock_1&userId=usr_mock_1',
      'token123',
    );
    expect(result).toEqual(mockShift);
  });

  it('getCurrent returns null on 404 (no open shift)', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new APIError(404, 'Not Found', { message: 'No open shift' }),
    );

    const result = await shiftsAPI.getCurrent('prop_mock_1', 'usr_mock_1');
    expect(result).toBeNull();
  });

  it('getCurrent rethrows non-404 errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new APIError(500, 'Internal Server Error'),
    );

    await expect(
      shiftsAPI.getCurrent('prop_mock_1', 'usr_mock_1'),
    ).rejects.toBeInstanceOf(APIError);
  });

  it('lists shifts for a property and business date', async () => {
    vi.mocked(apiClient.get).mockResolvedValue([mockShift]);

    const result = await shiftsAPI.list(
      'prop_mock_1',
      '2026-08-14T00:00:00.000Z',
    );

    expect(apiClient.get).toHaveBeenCalledWith(
      '/shifts?propertyId=prop_mock_1&businessDate=2026-08-14T00%3A00%3A00.000Z',
      'token123',
    );
    expect(result).toEqual([mockShift]);
  });

  it('gets a shift by id', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(mockShift);

    const result = await shiftsAPI.getById('sh_1');

    expect(apiClient.get).toHaveBeenCalledWith('/shifts/sh_1', 'token123');
    expect(result).toEqual(mockShift);
  });

  it('closes a shift', async () => {
    const closed = { ...mockShift, status: 'BALANCED' as const };
    vi.mocked(apiClient.post).mockResolvedValue(closed);

    const payload = { closingCash: 1000, userId: 'usr_mock_1' };
    const result = await shiftsAPI.close('sh_1', payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/shifts/sh_1/close',
      payload,
      'token123',
    );
    expect(result.status).toBe('BALANCED');
  });

  it('approves a shift', async () => {
    const approved = { ...mockShift, status: 'BALANCED' as const };
    vi.mocked(apiClient.post).mockResolvedValue(approved);

    const payload = { userId: 'usr_mock_1' };
    await shiftsAPI.approve('sh_1', payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/shifts/sh_1/approve',
      payload,
      'token123',
    );
  });

  it('hands over a shift', async () => {
    const handover = {
      closed: { ...mockShift, status: 'BALANCED' as const },
      opened: { ...mockShift, id: 'sh_2', userId: 'usr_mock_2' },
    };
    vi.mocked(apiClient.post).mockResolvedValue(handover);

    const payload = {
      toUserId: 'usr_mock_2',
      countedCash: 1000,
      userId: 'usr_mock_1',
    };
    const result = await shiftsAPI.handover('sh_1', payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/shifts/sh_1/handover',
      payload,
      'token123',
    );
    expect(result.opened.userId).toBe('usr_mock_2');
  });
});
