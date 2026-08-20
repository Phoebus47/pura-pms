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
  ConfirmTm30ReportDto,
  FailTm30ReportDto,
  FindTm30ReportsQueryDto,
  GenerateTm30ReportsDto,
  SubmitTm30ReportDto,
} from './dto/tm30-report.dto';
import { Tm30ReportsService } from './tm30-reports.service';

@Controller('tm30-reports')
@UseGuards(JwtAuthGuard)
export class Tm30ReportsController {
  constructor(private readonly tm30ReportsService: Tm30ReportsService) {}

  @Get()
  findAll(@Query() query: FindTm30ReportsQueryDto) {
    return this.tm30ReportsService.findAll(query);
  }

  @Get('export')
  exportTsv(@Query() query: FindTm30ReportsQueryDto) {
    return this.tm30ReportsService.exportTsv(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tm30ReportsService.findOne(id);
  }

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  generate(@Body() dto: GenerateTm30ReportsDto) {
    return this.tm30ReportsService.generate(dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitTm30ReportDto) {
    return this.tm30ReportsService.submit(id, dto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmTm30ReportDto) {
    return this.tm30ReportsService.confirm(id, dto);
  }

  @Post(':id/fail')
  fail(@Param('id') id: string, @Body() dto: FailTm30ReportDto) {
    return this.tm30ReportsService.fail(id, dto);
  }
}
