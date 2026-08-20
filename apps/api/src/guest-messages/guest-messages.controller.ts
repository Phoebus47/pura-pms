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
  CreateGuestMessageDto,
  FindGuestMessagesQueryDto,
} from './dto/guest-message.dto';
import { GuestMessagesService } from './guest-messages.service';

@Controller('guest-messages')
@UseGuards(JwtAuthGuard)
export class GuestMessagesController {
  constructor(private readonly guestMessagesService: GuestMessagesService) {}

  @Get()
  findAll(@Query() query: FindGuestMessagesQueryDto) {
    return this.guestMessagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestMessagesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGuestMessageDto) {
    return this.guestMessagesService.create(dto);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.guestMessagesService.markRead(id);
  }
}
