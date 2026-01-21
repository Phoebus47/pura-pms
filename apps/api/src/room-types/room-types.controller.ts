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
import { RoomTypesService } from './room-types.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('room-types')
@UseGuards(JwtAuthGuard)
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Post()
  create(@Body() createRoomTypeDto: CreateRoomTypeDto) {
    return this.roomTypesService.create(createRoomTypeDto);
  }

  @Get()
  findAll(@Query('propertyId') propertyId?: string) {
    return this.roomTypesService.findAll(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomTypeDto: UpdateRoomTypeDto,
  ) {
    return this.roomTypesService.update(id, updateRoomTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomTypesService.remove(id);
  }
}
