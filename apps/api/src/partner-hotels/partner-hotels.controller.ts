import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PartnerHotelsService } from './partner-hotels.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';
import { UpdatePartnerHotelDto } from './dto/update-partner-hotel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('partner-hotels')
@UseGuards(JwtAuthGuard)
export class PartnerHotelsController {
  constructor(private readonly partnerHotelsService: PartnerHotelsService) {}

  @Post()
  create(@Body() createPartnerHotelDto: CreatePartnerHotelDto) {
    return this.partnerHotelsService.create(createPartnerHotelDto);
  }

  @Get()
  findAll(@Query('propertyId') propertyId?: string) {
    return this.partnerHotelsService.findAll(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnerHotelsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePartnerHotelDto: UpdatePartnerHotelDto,
  ) {
    return this.partnerHotelsService.update(id, updatePartnerHotelDto);
  }
}
