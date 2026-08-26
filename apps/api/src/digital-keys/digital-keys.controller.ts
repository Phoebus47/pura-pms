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
import { DigitalKeysService } from './digital-keys.service';
import {
  FindDigitalKeysQueryDto,
  IssueDigitalKeyByConfirmNumberDto,
  IssueDigitalKeyDto,
  RevokeDigitalKeyDto,
} from './dto/digital-key.dto';

@Controller('digital-keys')
@UseGuards(JwtAuthGuard)
export class DigitalKeysController {
  constructor(private readonly digitalKeysService: DigitalKeysService) {}

  @Get()
  findAll(@Query() query: FindDigitalKeysQueryDto) {
    return this.digitalKeysService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.digitalKeysService.findOne(id);
  }

  @Post('issue')
  @HttpCode(HttpStatus.CREATED)
  issue(@Body() dto: IssueDigitalKeyDto) {
    return this.digitalKeysService.issue(dto);
  }

  @Post('issue-by-confirm')
  @HttpCode(HttpStatus.CREATED)
  issueByConfirmNumber(@Body() dto: IssueDigitalKeyByConfirmNumberDto) {
    return this.digitalKeysService.issueByConfirmNumber(dto);
  }

  @Post(':id/revoke')
  revoke(@Param('id') id: string, @Body() dto: RevokeDigitalKeyDto) {
    return this.digitalKeysService.revoke(id, dto);
  }
}
