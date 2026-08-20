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
  CloseGuestComplaintDto,
  CreateGuestComplaintDto,
  FindGuestComplaintsQueryDto,
  ResolveGuestComplaintDto,
  StartGuestComplaintDto,
} from './dto/guest-complaints.dto';
import { GuestComplaintsService } from './guest-complaints.service';

@Controller('guest-complaints')
@UseGuards(JwtAuthGuard)
export class GuestComplaintsController {
  constructor(
    private readonly guestComplaintsService: GuestComplaintsService,
  ) {}

  @Get()
  findAll(@Query() query: FindGuestComplaintsQueryDto) {
    return this.guestComplaintsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestComplaintsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGuestComplaintDto) {
    return this.guestComplaintsService.create(dto);
  }

  @Post(':id/start')
  start(@Param('id') id: string, @Body() dto: StartGuestComplaintDto) {
    return this.guestComplaintsService.start(id, dto);
  }

  @Post(':id/resolve')
  resolve(@Param('id') id: string, @Body() dto: ResolveGuestComplaintDto) {
    return this.guestComplaintsService.resolve(id, dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseGuestComplaintDto) {
    return this.guestComplaintsService.close(id, dto);
  }
}
