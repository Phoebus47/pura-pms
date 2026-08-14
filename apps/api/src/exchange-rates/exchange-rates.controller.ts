import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { FindExchangeRatesQueryDto } from './dto/find-exchange-rates-query.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  find(@Query() query: FindExchangeRatesQueryDto) {
    if (query.baseCurrency && query.targetCurrency && query.date) {
      return this.exchangeRatesService.findForDate(
        query.baseCurrency,
        query.targetCurrency,
        query.date,
      );
    }
    return this.exchangeRatesService.findActive();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateExchangeRateDto) {
    return this.exchangeRatesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateExchangeRateDto) {
    return this.exchangeRatesService.update(id, dto);
  }
}
