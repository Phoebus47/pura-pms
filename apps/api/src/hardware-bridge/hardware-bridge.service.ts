import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CompleteJobDto,
  CreateHardwareJobDto,
  FailJobDto,
  RegisterAgentDto,
} from './dto/hardware-bridge.dto';
import {
  completeJob,
  createJob,
  failJob,
  getCatalog,
  heartbeat,
  listAgents,
  listJobs,
  registerAgent,
  simulateJob,
} from './hb-ops';

@Injectable()
export class HardwareBridgeService {
  constructor(private readonly prisma: PrismaService) {}

  catalog() {
    return getCatalog();
  }

  listAgents(propertyId?: string) {
    return listAgents(this.prisma, propertyId);
  }

  registerAgent(dto: RegisterAgentDto) {
    return registerAgent(this.prisma, dto);
  }

  heartbeat(id: string) {
    return heartbeat(this.prisma, id);
  }

  listJobs(propertyId?: string, status?: string) {
    return listJobs(this.prisma, propertyId, status);
  }

  createJob(dto: CreateHardwareJobDto) {
    return createJob(this.prisma, dto);
  }

  completeJob(id: string, dto: CompleteJobDto) {
    return completeJob(this.prisma, id, dto.result);
  }

  failJob(id: string, dto: FailJobDto) {
    return failJob(this.prisma, id, dto.errorMessage);
  }

  simulateJob(id: string) {
    return simulateJob(this.prisma, id);
  }
}
