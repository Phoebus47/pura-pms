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
import { BlocksService } from './blocks.service';
import {
  AttachReservationDto,
  FindBlocksQueryDto,
} from './dto/block-query.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Controller('blocks')
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Post()
  create(@Body() dto: CreateBlockDto) {
    return this.blocksService.create(dto);
  }

  @Get()
  findAll(@Query() query: FindBlocksQueryDto) {
    return this.blocksService.findAll(query.propertyId);
  }

  @Get(':id/pickup')
  pickup(@Param('id') id: string) {
    return this.blocksService.pickup(id);
  }

  @Post(':id/release')
  release(@Param('id') id: string) {
    return this.blocksService.release(id);
  }

  @Post(':id/reservations')
  attach(@Param('id') id: string, @Body() dto: AttachReservationDto) {
    return this.blocksService.attach(id, dto);
  }

  @Post(':id/reservations/:reservationId/detach')
  detach(
    @Param('id') id: string,
    @Param('reservationId') reservationId: string,
  ) {
    return this.blocksService.detach(id, reservationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blocksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.blocksService.update(id, dto);
  }
}
