import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { runMockAdapter } from './hb-adapters';
import {
  agentCreateData,
  HB_AGENT_INCLUDE,
  HB_JOB_INCLUDE,
  hbStore,
  isPrismaUniqueConflict,
  requireAgent,
  requireJob,
  requireProperty,
  type HbJobRow,
} from './hb-db';
import {
  AGENT_DUPLICATE_MESSAGE,
  catalogPayload,
  isOpenableJobStatus,
  JOB_NOT_OPENABLE_MESSAGE,
} from './hb-rules';

export interface RegisterAgentInput {
  propertyId: string;
  name: string;
  machineId: string;
}

export interface CreateHardwareJobInput {
  propertyId: string;
  type: string;
  requestedBy: string;
  payload: Record<string, unknown>;
  agentId?: string;
  deviceId?: string;
  idempotencyKey?: string;
  reservationId?: string;
}

export function getCatalog() {
  return catalogPayload();
}

export async function listAgents(prisma: unknown, propertyId?: string) {
  return hbStore(prisma).hardwareAgent.findMany({
    where: propertyId ? { propertyId } : {},
    include: HB_AGENT_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

export async function registerAgent(prisma: unknown, dto: RegisterAgentInput) {
  await requireProperty(prisma, dto.propertyId);
  const duplicate = await hbStore(prisma).hardwareAgent.findFirst({
    where: { propertyId: dto.propertyId, machineId: dto.machineId },
  });
  if (duplicate) {
    throw new ConflictException(AGENT_DUPLICATE_MESSAGE);
  }
  try {
    return await hbStore(prisma).hardwareAgent.create({
      data: agentCreateData(dto),
      include: HB_AGENT_INCLUDE,
    });
  } catch (err: unknown) {
    throwIfAgentConflict(err);
  }
}

export async function heartbeat(prisma: unknown, id: string) {
  await requireAgent(prisma, id);
  return hbStore(prisma).hardwareAgent.update({
    where: { id },
    data: { lastSeenAt: new Date() },
    include: HB_AGENT_INCLUDE,
  });
}

export async function listJobs(
  prisma: unknown,
  propertyId?: string,
  status?: string,
) {
  return hbStore(prisma).hardwareJob.findMany({
    where: {
      ...(propertyId ? { propertyId } : {}),
      ...(status ? { status } : {}),
    },
    include: HB_JOB_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createJob(prisma: unknown, dto: CreateHardwareJobInput) {
  await requireProperty(prisma, dto.propertyId);
  if (dto.agentId) {
    await requireAgentForProperty(prisma, dto.agentId, dto.propertyId);
  }
  const existing = await findByIdempotencyKey(prisma, dto.idempotencyKey);
  if (existing) {
    return existing;
  }
  try {
    return await hbStore(prisma).hardwareJob.create({
      data: jobCreateData(dto),
      include: HB_JOB_INCLUDE,
    });
  } catch (err: unknown) {
    return retryIdempotentCreate(prisma, dto.idempotencyKey, err);
  }
}

export async function completeJob(
  prisma: unknown,
  id: string,
  result: Record<string, unknown>,
) {
  const job = await requireOpenJob(prisma, id);
  return applyJobComplete(prisma, job, result);
}

export async function failJob(
  prisma: unknown,
  id: string,
  errorMessage: string,
) {
  const job = await requireOpenJob(prisma, id);
  return hbStore(prisma).hardwareJob.update({
    where: { id: job.id },
    data: {
      status: 'FAILED',
      errorMessage,
      completedAt: new Date(),
    },
    include: HB_JOB_INCLUDE,
  });
}

export async function simulateJob(prisma: unknown, id: string) {
  const job = await requireOpenJob(prisma, id);
  const result = runMockAdapter(job.type, job.id, job.payload);
  return applyJobComplete(prisma, job, result);
}

function throwIfAgentConflict(err: unknown): never {
  if (isPrismaUniqueConflict(err)) {
    throw new ConflictException(AGENT_DUPLICATE_MESSAGE);
  }
  throw err;
}

async function requireAgentForProperty(
  prisma: unknown,
  agentId: string,
  propertyId: string,
) {
  const agent = await requireAgent(prisma, agentId);
  if (agent.propertyId !== propertyId) {
    throw new NotFoundException(`Hardware agent with ID ${agentId} not found`);
  }
  return agent;
}

async function findByIdempotencyKey(prisma: unknown, key?: string) {
  if (!key) {
    return null;
  }
  return hbStore(prisma).hardwareJob.findUnique({
    where: { idempotencyKey: key },
    include: HB_JOB_INCLUDE,
  });
}

async function retryIdempotentCreate(
  prisma: unknown,
  key: string | undefined,
  err: unknown,
) {
  if (key && isPrismaUniqueConflict(err)) {
    const existing = await findByIdempotencyKey(prisma, key);
    if (existing) {
      return existing;
    }
  }
  throw err;
}

function jobCreateData(dto: CreateHardwareJobInput) {
  return {
    propertyId: dto.propertyId,
    type: dto.type,
    requestedBy: dto.requestedBy,
    payload: dto.payload,
    status: 'PENDING',
    agentId: dto.agentId,
    deviceId: dto.deviceId,
    idempotencyKey: dto.idempotencyKey,
    reservationId: dto.reservationId,
  };
}

async function requireOpenJob(prisma: unknown, id: string) {
  const job = await requireJob(prisma, id);
  if (!isOpenableJobStatus(job.status)) {
    throw new BadRequestException(JOB_NOT_OPENABLE_MESSAGE);
  }
  return job;
}

function applyJobComplete(
  prisma: unknown,
  job: HbJobRow,
  result: Record<string, unknown>,
) {
  const now = new Date();
  return hbStore(prisma).hardwareJob.update({
    where: { id: job.id },
    data: {
      status: 'COMPLETED',
      result,
      completedAt: now,
      ...(job.startedAt ? {} : { startedAt: now }),
    },
    include: HB_JOB_INCLUDE,
  });
}
