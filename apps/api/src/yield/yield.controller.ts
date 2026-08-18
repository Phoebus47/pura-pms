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
import { CreateCompetitorRateDto } from './dto/create-competitor-rate.dto';
import { GenerateYieldDto } from './dto/generate-yield.dto';
import { UpdateCompetitorRateDto } from './dto/update-competitor-rate.dto';
import {
  YieldPaceQueryDto,
  YieldPropertyQueryDto,
} from './dto/yield-query.dto';
import { YieldService } from './yield.service';

@Controller('yield')
@UseGuards(JwtAuthGuard)
export class YieldController {
  constructor(private readonly yieldService: YieldService) {}

  @Get('pace')
  getPace(@Query() query: YieldPaceQueryDto) {
    return this.yieldService.getPace(query.propertyId, query.from, query.to);
  }

  @Get('recommendations')
  listRecommendations(@Query() query: YieldPropertyQueryDto) {
    return this.yieldService.listRecommendations(
      query.propertyId,
      query.status,
    );
  }

  @Post('recommendations/generate')
  generateRecommendations(@Body() dto: GenerateYieldDto) {
    return this.yieldService.generateRecommendations(dto.propertyId);
  }

  @Post('recommendations/:id/apply')
  applyRecommendation(@Param('id') id: string) {
    return this.yieldService.applyRecommendation(id);
  }

  @Post('recommendations/:id/dismiss')
  dismissRecommendation(@Param('id') id: string) {
    return this.yieldService.dismissRecommendation(id);
  }

  @Get('competitors')
  listCompetitorRates(@Query() query: YieldPropertyQueryDto) {
    return this.yieldService.listCompetitorRates(query.propertyId);
  }

  @Post('competitors')
  createCompetitorRate(@Body() dto: CreateCompetitorRateDto) {
    return this.yieldService.createCompetitorRate(dto);
  }

  @Patch('competitors/:id')
  updateCompetitorRate(
    @Param('id') id: string,
    @Body() dto: UpdateCompetitorRateDto,
  ) {
    return this.yieldService.updateCompetitorRate(id, dto);
  }
}
