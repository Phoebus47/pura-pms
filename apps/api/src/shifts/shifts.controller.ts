import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { ApproveShiftDto } from './dto/approve-shift.dto';
import { HandoverShiftDto } from './dto/handover-shift.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  open(@Body() dto: OpenShiftDto) {
    return this.shiftsService.open(dto);
  }

  @Get('current')
  findCurrent(
    @Query('propertyId') propertyId: string,
    @Query('userId') userId: string,
  ) {
    return this.shiftsService.findCurrent(propertyId, userId);
  }

  @Get()
  findAll(
    @Query('propertyId') propertyId: string,
    @Query('businessDate') businessDate: string,
  ) {
    return this.shiftsService.findAll(propertyId, businessDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseShiftDto) {
    return this.shiftsService.close(id, dto);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApproveShiftDto) {
    return this.shiftsService.approve(id, dto);
  }

  @Post(':id/handover')
  handover(@Param('id') id: string, @Body() dto: HandoverShiftDto) {
    return this.shiftsService.handover(id, dto);
  }
}
