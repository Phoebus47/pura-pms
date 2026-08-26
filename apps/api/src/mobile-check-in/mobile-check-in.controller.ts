import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { MobileCheckInDto } from './dto/mobile-check-in.dto';
import { SelectRoomDto } from './dto/select-room.dto';
import { MobileCheckInService } from './mobile-check-in.service';

/**
 * Public, guest-facing endpoints for pre-arrival mobile check-in.
 * Intentionally NOT behind JwtAuthGuard: guests authenticate implicitly by
 * knowing their confirmation number plus an optional last-name check.
 */
@Controller('mobile-check-in')
export class MobileCheckInController {
  constructor(private readonly mobileCheckInService: MobileCheckInService) {}

  @Get(':confirmNumber')
  lookup(
    @Param('confirmNumber') confirmNumber: string,
    @Query('lastName') lastName?: string,
  ) {
    return this.mobileCheckInService.lookup(confirmNumber, lastName);
  }

  @Get(':confirmNumber/rooms')
  listAvailableRooms(
    @Param('confirmNumber') confirmNumber: string,
    @Query('lastName') lastName?: string,
  ) {
    return this.mobileCheckInService.listAvailableRooms(
      confirmNumber,
      lastName,
    );
  }

  @Post(':confirmNumber/room')
  @HttpCode(HttpStatus.OK)
  selectRoom(
    @Param('confirmNumber') confirmNumber: string,
    @Body() dto: SelectRoomDto,
  ) {
    return this.mobileCheckInService.selectRoom(confirmNumber, dto);
  }

  @Post(':confirmNumber/check-in')
  @HttpCode(HttpStatus.OK)
  checkIn(
    @Param('confirmNumber') confirmNumber: string,
    @Body() dto: MobileCheckInDto,
  ) {
    return this.mobileCheckInService.checkIn(confirmNumber, dto.lastName);
  }
}
