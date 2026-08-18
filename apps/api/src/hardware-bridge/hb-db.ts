import { NotFoundException } from '@nestjs/common';
import { defaultDeviceCreates } from './hb-rules';

export interface HbAgentRow {
  id: string;
  propertyId: string;
  name: string;
  machineId: string;
  isActive: boolean;
  lastSeenAt: Date | null;
}

export interface HbJobRow {
  id: string;
  propertyId: string;
  agentId: string | null;
  deviceId: string | null;
  type: string;
  status: string;
  payload: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface HbStore {
  property: {
    findUnique: (
      args: Record<string, unknown>,
    ) => Promise<{ id: string } | null>;
  };
  hardwareAgent: {
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
    findUnique: (args: Record<string, unknown>) => Promise<HbAgentRow | null>;
    findFirst: (args: Record<string, unknown>) => Promise<HbAgentRow | null>;
    create: (args: Record<string, unknown>) => Promise<unknown>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
  hardwareJob: {
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
    findUnique: (args: Record<string, unknown>) => Promise<HbJobRow | null>;
    create: (args: Record<string, unknown>) => Promise<unknown>;
    update: (args: Record<string, unknown>) => Promise<unknown>;
  };
}

export const HB_AGENT_INCLUDE = { devices: true };

export const HB_JOB_INCLUDE = { agent: true, device: true };

export function hbStore(prisma: unknown): HbStore {
  return prisma as HbStore;
}

export function isPrismaUniqueConflict(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}

export async function requireProperty(prisma: unknown, propertyId: string) {
  const property = await hbStore(prisma).property.findUnique({
    where: { id: propertyId },
  });
  if (!property) {
    throw new NotFoundException(`Property with ID ${propertyId} not found`);
  }
  return property;
}

export async function requireAgent(prisma: unknown, id: string) {
  const agent = await hbStore(prisma).hardwareAgent.findUnique({
    where: { id },
  });
  if (!agent) {
    throw new NotFoundException(`Hardware agent with ID ${id} not found`);
  }
  return agent;
}

export async function requireJob(prisma: unknown, id: string) {
  const job = await hbStore(prisma).hardwareJob.findUnique({
    where: { id },
    include: HB_JOB_INCLUDE,
  });
  if (!job) {
    throw new NotFoundException(`Hardware job with ID ${id} not found`);
  }
  return job;
}

export function agentCreateData(dto: {
  propertyId: string;
  name: string;
  machineId: string;
}) {
  return {
    propertyId: dto.propertyId,
    name: dto.name,
    machineId: dto.machineId,
    devices: { create: defaultDeviceCreates() },
  };
}
