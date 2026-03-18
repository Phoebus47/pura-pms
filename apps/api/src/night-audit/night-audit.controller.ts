import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { NightAuditService } from './night-audit.service';
import { StartAuditDto } from './dto/start-audit.dto';

@Controller('night-audit')
export class NightAuditController {
  constructor(private readonly nightAuditService: NightAuditService) {}

  @Post('run')
  async runAudit(@Body() dto: StartAuditDto) {
    return this.nightAuditService.startAudit(
      dto.propertyId,
      new Date(dto.businessDate),
    );
  }

  @Get('status/:propertyId/:businessDate')
  async getStatus(
    @Param('propertyId') propertyId: string,
    @Param('businessDate') businessDate: string,
  ) {
    return this.nightAuditService.getAuditStatus(
      propertyId,
      new Date(businessDate),
    );
  }
}
