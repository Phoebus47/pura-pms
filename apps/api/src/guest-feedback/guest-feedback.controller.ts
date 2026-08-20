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
  CreateGuestFeedbackDto,
  FindGuestFeedbackQueryDto,
  ReviewGuestFeedbackDto,
} from './dto/guest-feedback.dto';
import { GuestFeedbackService } from './guest-feedback.service';

@Controller('guest-feedback')
@UseGuards(JwtAuthGuard)
export class GuestFeedbackController {
  constructor(private readonly guestFeedbackService: GuestFeedbackService) {}

  @Get()
  findAll(@Query() query: FindGuestFeedbackQueryDto) {
    return this.guestFeedbackService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGuestFeedbackDto) {
    return this.guestFeedbackService.create(dto);
  }

  @Post(':id/review')
  review(@Param('id') id: string, @Body() dto: ReviewGuestFeedbackDto) {
    return this.guestFeedbackService.review(id, dto);
  }
}
