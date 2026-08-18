import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRateDto } from './dto/create-rate.dto';
import { FindRatesQueryDto } from './dto/find-rates-query.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { RatesService } from './rates.service';

@Controller('rates')
@UseGuards(JwtAuthGuard)
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  create(@Body() createRateDto: CreateRateDto) {
    return this.ratesService.create(createRateDto);
  }

  @Get()
  findAll(@Query() query: FindRatesQueryDto) {
    return this.ratesService.findAll(query.propertyId, query.roomTypeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRateDto: UpdateRateDto) {
    return this.ratesService.update(id, updateRateDto);
  }
}
