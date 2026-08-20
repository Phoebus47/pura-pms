import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KioskCheckInDto } from './dto/kiosk-check-in.dto';
import { KioskService } from './kiosk.service';

@Controller('kiosk')
@UseGuards(JwtAuthGuard)
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  checkIn(@Body() dto: KioskCheckInDto) {
    return this.kioskService.checkIn(dto);
  }
}
