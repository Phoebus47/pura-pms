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
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('guests')
@UseGuards(JwtAuthGuard)
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Post()
  create(@Body() createGuestDto: CreateGuestDto) {
    return this.guestsService.create(createGuestDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('isBlacklist') isBlacklist?: string,
    @Query('vipLevel') vipLevel?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.guestsService.findAll(
      search,
      isBlacklist === 'true',
      vipLevel ? parseInt(vipLevel) : undefined,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined,
    );
  }

  @Get('search/email')
  findByEmail(@Query('email') email: string) {
    return this.guestsService.findByEmail(email);
  }

  @Get('search/phone')
  findByPhone(@Query('phone') phone: string) {
    return this.guestsService.findByPhone(phone);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guestsService.findOne(id);
  }

  @Get(':id/history')
  getGuestHistory(@Param('id') id: string) {
    return this.guestsService.getGuestHistory(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.guestsService.update(id, updateGuestDto);
  }

  @Patch(':id/vip-level')
  updateVipLevel(@Param('id') id: string, @Body('vipLevel') vipLevel: number) {
    return this.guestsService.updateVipLevel(id, vipLevel);
  }

  @Patch(':id/blacklist')
  toggleBlacklist(@Param('id') id: string) {
    return this.guestsService.toggleBlacklist(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guestsService.remove(id);
  }
}
