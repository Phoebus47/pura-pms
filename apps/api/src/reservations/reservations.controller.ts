import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { MarkNoShowDto } from './dto/mark-no-show.dto';
import { WalkReservationDto } from './dto/walk-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationStatus, StayPurpose } from '@pura/database';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  findAll(
    @Query('propertyId') propertyId?: string,
    @Query('status') status?: ReservationStatus,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('guestId') guestId?: string,
    @Query('stayPurpose') stayPurpose?: StayPurpose,
    @Query('taxExempt') taxExempt?: string,
    @Query('isRoomLocked') isRoomLocked?: string,
  ) {
    return this.reservationsService.findAll(
      propertyId,
      status,
      checkIn ? new Date(checkIn) : undefined,
      checkOut ? new Date(checkOut) : undefined,
      guestId,
      stayPurpose,
      taxExempt === 'true' ? true : taxExempt === 'false' ? false : undefined,
      isRoomLocked === 'true'
        ? true
        : isRoomLocked === 'false'
          ? false
          : undefined,
    );
  }

  @Get('calendar')
  getCalendar(
    @Query('propertyId') propertyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('roomTypeId') roomTypeId?: string,
  ) {
    return this.reservationsService.getCalendar(
      propertyId,
      new Date(startDate),
      new Date(endDate),
      roomTypeId,
    );
  }

  @Get('confirm/:confirmNumber')
  findByConfirmNumber(@Param('confirmNumber') confirmNumber: string) {
    return this.reservationsService.findByConfirmNumber(confirmNumber);
  }

  @Get(':id/room-moves')
  listRoomMoves(@Param('id') id: string) {
    return this.reservationsService.listRoomMoves(id);
  }

  @Get(':id/walks')
  listWalks(@Param('id') id: string) {
    return this.reservationsService.listWalks(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Post(':id/room-move')
  @HttpCode(HttpStatus.CREATED)
  moveRoom(@Param('id') id: string, @Body() dto: MoveRoomDto) {
    return this.reservationsService.moveRoom(id, dto);
  }

  @Patch(':id/check-in')
  checkIn(@Param('id') id: string) {
    return this.reservationsService.checkIn(id);
  }

  @Patch(':id/check-out')
  checkOut(@Param('id') id: string) {
    return this.reservationsService.checkOut(id);
  }

  @Post(':id/no-show')
  @HttpCode(HttpStatus.CREATED)
  markNoShow(@Param('id') id: string, @Body() dto: MarkNoShowDto) {
    return this.reservationsService.markNoShow(id, dto);
  }

  @Post(':id/walk')
  @HttpCode(HttpStatus.CREATED)
  walk(@Param('id') id: string, @Body() dto: WalkReservationDto) {
    return this.reservationsService.walk(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.reservationsService.cancel(id, reason);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    throw new Error(
      `Reservations cannot be deleted (ID: ${_id}). Use cancel instead.`,
    );
  }
}
