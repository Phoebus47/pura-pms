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
  CreatePrintJobDto,
  CreateRegistrationCardDto,
  FindRegistrationCardsQueryDto,
  SignRegistrationCardDto,
  VoidRegistrationCardDto,
} from './dto/registration-card.dto';
import { RegistrationCardsService } from './registration-cards.service';

@Controller('registration-cards')
@UseGuards(JwtAuthGuard)
export class RegistrationCardsController {
  constructor(
    private readonly registrationCardsService: RegistrationCardsService,
  ) {}

  @Get()
  findByReservation(@Query() query: FindRegistrationCardsQueryDto) {
    return this.registrationCardsService.findByReservation(query.reservationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.registrationCardsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createDraft(@Body() dto: CreateRegistrationCardDto) {
    return this.registrationCardsService.createDraft(dto);
  }

  @Post(':id/sign')
  sign(@Param('id') id: string, @Body() dto: SignRegistrationCardDto) {
    return this.registrationCardsService.sign(id, dto);
  }

  @Post(':id/void')
  voidCard(@Param('id') id: string, @Body() dto: VoidRegistrationCardDto) {
    return this.registrationCardsService.void(id, dto);
  }

  @Post(':id/print-job')
  @HttpCode(HttpStatus.CREATED)
  createPrintJob(@Param('id') id: string, @Body() dto: CreatePrintJobDto) {
    return this.registrationCardsService.createPrintJob(id, dto);
  }
}
