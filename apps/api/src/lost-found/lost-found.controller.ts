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
  ClaimLostFoundItemDto,
  CreateLostFoundItemDto,
  DisposeLostFoundItemDto,
  FindLostFoundQueryDto,
  ReturnLostFoundItemDto,
} from './dto/lost-found.dto';
import { LostFoundService } from './lost-found.service';

@Controller('lost-found')
@UseGuards(JwtAuthGuard)
export class LostFoundController {
  constructor(private readonly lostFoundService: LostFoundService) {}

  @Get()
  findAll(@Query() query: FindLostFoundQueryDto) {
    return this.lostFoundService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lostFoundService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateLostFoundItemDto) {
    return this.lostFoundService.create(dto);
  }

  @Post(':id/claim')
  claim(@Param('id') id: string, @Body() dto: ClaimLostFoundItemDto) {
    return this.lostFoundService.claim(id, dto);
  }

  @Post(':id/return')
  returnItem(@Param('id') id: string, @Body() dto: ReturnLostFoundItemDto) {
    return this.lostFoundService.returnItem(id, dto);
  }

  @Post(':id/dispose')
  dispose(@Param('id') id: string, @Body() dto: DisposeLostFoundItemDto) {
    return this.lostFoundService.dispose(id, dto);
  }
}
