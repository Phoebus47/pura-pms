import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateInspectionDto,
  FindHousekeepingQueryDto,
  SetGuestRequestDto,
} from './dto/housekeeping.dto';
import { HousekeepingService } from './housekeeping.service';

@Controller('housekeeping')
@UseGuards(JwtAuthGuard)
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('board')
  board(@Query() query: FindHousekeepingQueryDto) {
    return this.housekeepingService.board(query.propertyId);
  }

  @Get('checklist')
  checklist() {
    return this.housekeepingService.checklist();
  }

  @Post('rooms/:id/clean')
  markClean(@Param('id') id: string) {
    return this.housekeepingService.markClean(id);
  }

  @Post('rooms/:id/guest-request')
  setGuestRequest(@Param('id') id: string, @Body() dto: SetGuestRequestDto) {
    return this.housekeepingService.setGuestRequest(id, dto);
  }

  @Get('rooms/:id/inspections')
  inspections(@Param('id') id: string) {
    return this.housekeepingService.inspections(id);
  }

  @Post('rooms/:id/inspections')
  inspect(@Param('id') id: string, @Body() dto: CreateInspectionDto) {
    return this.housekeepingService.inspect(id, dto);
  }
}
