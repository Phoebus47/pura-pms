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
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReservationStatus } from '@pura/database';

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
  ) {
    return this.reservationsService.findAll(
      propertyId,
      status,
      checkIn ? new Date(checkIn) : undefined,
      checkOut ? new Date(checkOut) : undefined,
      guestId,
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

  @Patch(':id/check-in')
  checkIn(@Param('id') id: string) {
    return this.reservationsService.checkIn(id);
  }

  @Patch(':id/check-out')
  checkOut(@Param('id') id: string) {
    return this.reservationsService.checkOut(id);
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
