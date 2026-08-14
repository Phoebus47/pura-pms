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
import { CardPreauthsService } from './card-preauths.service';
import { CreateCardPreauthDto } from './dto/create-card-preauth.dto';
import { IncrementCardPreauthDto } from './dto/increment-card-preauth.dto';
import { CaptureCardPreauthDto } from './dto/capture-card-preauth.dto';
import { FindCardPreauthsQueryDto } from './dto/find-card-preauths-query.dto';

@Controller('card-preauths')
@UseGuards(JwtAuthGuard)
export class CardPreauthsController {
  constructor(private readonly cardPreauthsService: CardPreauthsService) {}

  @Get()
  findAll(@Query() query: FindCardPreauthsQueryDto) {
    return this.cardPreauthsService.findAll(query.reservationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cardPreauthsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCardPreauthDto) {
    return this.cardPreauthsService.create(dto);
  }

  @Patch(':id')
  increment(@Param('id') id: string, @Body() dto: IncrementCardPreauthDto) {
    return this.cardPreauthsService.increment(id, dto);
  }

  @Post(':id/capture')
  capture(@Param('id') id: string, @Body() dto: CaptureCardPreauthDto) {
    return this.cardPreauthsService.capture(id, dto);
  }

  @Post(':id/release')
  release(@Param('id') id: string) {
    return this.cardPreauthsService.release(id);
  }
}
