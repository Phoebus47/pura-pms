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
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoomStatus } from '@pura/database';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomsService.create(createRoomDto);
  }

  @Get()
  findAll(
    @Query('propertyId') propertyId?: string,
    @Query('roomTypeId') roomTypeId?: string,
    @Query('status') status?: RoomStatus,
  ) {
    return this.roomsService.findAll(propertyId, roomTypeId, status);
  }

  @Get('availability')
  getAvailability(
    @Query('propertyId') propertyId: string,
    @Query('checkIn') checkIn: string,
    @Query('checkOut') checkOut: string,
    @Query('roomTypeId') roomTypeId?: string,
  ) {
    return this.roomsService.getAvailability(
      propertyId,
      new Date(checkIn),
      new Date(checkOut),
      roomTypeId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomsService.update(id, updateRoomDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: RoomStatus) {
    return this.roomsService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
