import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CompleteJobDto,
  CreateHardwareJobDto,
  FailJobDto,
  FindHardwareQueryDto,
  RegisterAgentDto,
} from './dto/hardware-bridge.dto';
import { HardwareBridgeService } from './hardware-bridge.service';

@Controller('hardware-bridge')
@UseGuards(JwtAuthGuard)
export class HardwareBridgeController {
  constructor(private readonly hardwareBridgeService: HardwareBridgeService) {}

  @Get('catalog')
  catalog() {
    return this.hardwareBridgeService.catalog();
  }

  @Get('agents')
  listAgents(@Query() query: FindHardwareQueryDto) {
    return this.hardwareBridgeService.listAgents(query.propertyId);
  }

  @Post('agents')
  @HttpCode(HttpStatus.CREATED)
  registerAgent(@Body() dto: RegisterAgentDto) {
    return this.hardwareBridgeService.registerAgent(dto);
  }

  @Post('agents/:id/heartbeat')
  heartbeat(@Param('id') id: string) {
    return this.hardwareBridgeService.heartbeat(id);
  }

  @Get('jobs')
  listJobs(@Query() query: FindHardwareQueryDto) {
    return this.hardwareBridgeService.listJobs(query.propertyId, query.status);
  }

  @Post('jobs')
  @HttpCode(HttpStatus.CREATED)
  createJob(@Body() dto: CreateHardwareJobDto) {
    return this.hardwareBridgeService.createJob(dto);
  }

  @Post('jobs/:id/complete')
  completeJob(@Param('id') id: string, @Body() dto: CompleteJobDto) {
    return this.hardwareBridgeService.completeJob(id, dto);
  }

  @Post('jobs/:id/fail')
  failJob(@Param('id') id: string, @Body() dto: FailJobDto) {
    return this.hardwareBridgeService.failJob(id, dto);
  }

  @Post('jobs/:id/simulate')
  simulateJob(@Param('id') id: string) {
    return this.hardwareBridgeService.simulateJob(id);
  }
}
