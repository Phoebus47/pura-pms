import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  completeJob,
  createJob,
  failJob,
  heartbeat,
  registerAgent,
  simulateJob,
} from './hb-ops';
import { AGENT_DUPLICATE_MESSAGE } from './hb-rules';

function agentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'agent-1',
    propertyId: 'prop-1',
    name: 'Front desk PC',
    machineId: 'pc-1',
    isActive: true,
    lastSeenAt: null,
    devices: [],
    ...overrides,
  };
}

function jobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    propertyId: 'prop-1',
    agentId: null,
    deviceId: null,
    type: 'PRINT',
    status: 'PENDING',
    payload: {},
    startedAt: null,
    completedAt: null,
    ...overrides,
  };
}

function prismaMock() {
  const agent = agentRow();
  const job = jobRow();
  return {
    property: {
      findUnique: vi.fn().mockResolvedValue({ id: 'prop-1' }),
    },
    hardwareAgent: {
      findMany: vi.fn().mockResolvedValue([agent]),
      findUnique: vi.fn().mockResolvedValue(agent),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(agent),
      update: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          ...agent,
          ...args.data,
        })),
    },
    hardwareJob: {
      findMany: vi.fn().mockResolvedValue([job]),
      findUnique: vi.fn().mockResolvedValue(job),
      create: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          id: 'job-1',
          ...args.data,
        })),
      update: vi
        .fn()
        .mockImplementation((args: { data: Record<string, unknown> }) => ({
          ...job,
          ...args.data,
        })),
    },
  };
}

const printJob = {
  propertyId: 'prop-1',
  type: 'PRINT',
  requestedBy: 'usr-1',
  payload: {},
};

describe('hb-ops', () => {
  let prisma: ReturnType<typeof prismaMock>;

  beforeEach(() => {
    prisma = prismaMock();
  });

  it('registers an agent with four default devices', async () => {
    await registerAgent(prisma, {
      propertyId: 'prop-1',
      name: 'Front desk PC',
      machineId: 'pc-1',
    });
    const data = prisma.hardwareAgent.create.mock.calls[0][0].data as {
      devices: { create: unknown[] };
    };
    expect(data.devices.create).toHaveLength(4);
    expect(data.devices.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'PRINTER',
          label: 'Receipt printer',
          isDefault: true,
        }),
      ]),
    );
  });

  it('rejects a duplicate machineId with 409', async () => {
    prisma.hardwareAgent.findFirst.mockResolvedValue(agentRow());
    await expect(
      registerAgent(prisma, {
        propertyId: 'prop-1',
        name: 'Dup',
        machineId: 'pc-1',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    await expect(
      registerAgent(prisma, {
        propertyId: 'prop-1',
        name: 'Dup',
        machineId: 'pc-1',
      }),
    ).rejects.toMatchObject({ message: AGENT_DUPLICATE_MESSAGE });
  });

  it('heartbeats an agent', async () => {
    await heartbeat(prisma, 'agent-1');
    expect(prisma.hardwareAgent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ lastSeenAt: expect.any(Date) }),
      }),
    );
  });

  it('creates a pending job', async () => {
    prisma.hardwareJob.findUnique.mockResolvedValue(null);
    await createJob(prisma, printJob);
    expect(prisma.hardwareJob.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'PRINT',
          status: 'PENDING',
          requestedBy: 'usr-1',
        }),
      }),
    );
  });

  it('returns the existing job for an idempotency key', async () => {
    prisma.hardwareJob.findUnique.mockResolvedValue(jobRow({ id: 'job-dup' }));
    const result = (await createJob(prisma, {
      ...printJob,
      idempotencyKey: 'idem-1',
    })) as { id: string };
    expect(result.id).toBe('job-dup');
    expect(prisma.hardwareJob.create).not.toHaveBeenCalled();
  });

  it('completes a pending job', async () => {
    await completeJob(prisma, 'job-1', { printed: true });
    expect(prisma.hardwareJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'COMPLETED',
          result: { printed: true },
          completedAt: expect.any(Date),
          startedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('fails a pending job', async () => {
    await failJob(prisma, 'job-1', 'printer jam');
    expect(prisma.hardwareJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'printer jam',
          completedAt: expect.any(Date),
        }),
      }),
    );
  });

  it('simulates print encode and scan', async () => {
    await simulateJob(prisma, 'job-1');
    expect(prisma.hardwareJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: { printed: true, copies: 1 },
        }),
      }),
    );
    prisma.hardwareJob.findUnique.mockResolvedValue(
      jobRow({ type: 'KEYCARD_ENCODE', payload: { roomNumber: '101' } }),
    );
    await simulateJob(prisma, 'job-1');
    expect(prisma.hardwareJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: expect.objectContaining({
            encoded: true,
            vendorReference: 'MOCK-job-1',
          }),
        }),
      }),
    );
    prisma.hardwareJob.findUnique.mockResolvedValue(
      jobRow({ type: 'PASSPORT_SCAN', payload: {} }),
    );
    await simulateJob(prisma, 'job-1');
    expect(prisma.hardwareJob.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          result: expect.objectContaining({ firstName: 'SOMCHAI' }),
        }),
      }),
    );
  });

  it('cannot complete an already completed job', async () => {
    prisma.hardwareJob.findUnique.mockResolvedValue(
      jobRow({ status: 'COMPLETED' }),
    );
    await expect(
      completeJob(prisma, 'job-1', { printed: true }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns 404 when property or agent is missing', async () => {
    prisma.property.findUnique.mockResolvedValue(null);
    await expect(
      registerAgent(prisma, {
        propertyId: 'missing',
        name: 'PC',
        machineId: 'pc-9',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    prisma.property.findUnique.mockResolvedValue({ id: 'prop-1' });
    prisma.hardwareAgent.findUnique.mockResolvedValue(null);
    await expect(
      createJob(prisma, { ...printJob, agentId: 'agent-missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(heartbeat(prisma, 'agent-missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
