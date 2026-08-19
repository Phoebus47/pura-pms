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
  CancelWakeUpCallDto,
  CompleteWakeUpCallDto,
  CreateWakeUpCallDto,
  FindWakeUpCallsQueryDto,
  MissWakeUpCallDto,
} from './dto/wake-up-call.dto';
import { WakeUpCallsService } from './wake-up-calls.service';

@Controller('wake-up-calls')
@UseGuards(JwtAuthGuard)
export class WakeUpCallsController {
  constructor(private readonly wakeUpCallsService: WakeUpCallsService) {}

  @Get()
  findAll(@Query() query: FindWakeUpCallsQueryDto) {
    return this.wakeUpCallsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wakeUpCallsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateWakeUpCallDto) {
    return this.wakeUpCallsService.create(dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteWakeUpCallDto) {
    return this.wakeUpCallsService.complete(id, dto);
  }

  @Post(':id/miss')
  miss(@Param('id') id: string, @Body() dto: MissWakeUpCallDto) {
    return this.wakeUpCallsService.miss(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelWakeUpCallDto) {
    return this.wakeUpCallsService.cancel(id, dto);
  }
}
