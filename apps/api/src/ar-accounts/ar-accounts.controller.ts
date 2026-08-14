import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ArAccountsService } from './ar-accounts.service';
import { CreateArAccountDto } from './dto/create-ar-account.dto';
import { UpdateArAccountDto } from './dto/update-ar-account.dto';
import { FindArAccountsQueryDto } from './dto/find-ar-accounts-query.dto';
import { FindArStatementQueryDto } from './dto/find-ar-statement-query.dto';
import { TransferFolioDto } from './dto/transfer-folio.dto';

@Controller('ar-accounts')
@UseGuards(JwtAuthGuard)
export class ArAccountsController {
  constructor(private readonly arAccountsService: ArAccountsService) {}

  @Get()
  findAll(@Query() query: FindArAccountsQueryDto) {
    return this.arAccountsService.findAll(query.propertyId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateArAccountDto) {
    return this.arAccountsService.create(dto);
  }

  @Get(':id/aging')
  aging(@Param('id') id: string, @Query() query: FindArStatementQueryDto) {
    return this.arAccountsService.aging(id, query.asOf);
  }

  @Get(':id/statement.html')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async statementHtml(
    @Param('id') id: string,
    @Query() query: FindArStatementQueryDto,
  ) {
    const statement = await this.arAccountsService.getStatement(id, query.asOf);
    return this.arAccountsService.renderStatementHtml(statement);
  }

  @Get(':id/statement')
  statement(@Param('id') id: string, @Query() query: FindArStatementQueryDto) {
    return this.arAccountsService.getStatement(id, query.asOf);
  }

  @Post(':id/transfer')
  @HttpCode(HttpStatus.CREATED)
  transfer(@Param('id') id: string, @Body() dto: TransferFolioDto) {
    return this.arAccountsService.transfer(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.arAccountsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateArAccountDto) {
    return this.arAccountsService.update(id, dto);
  }
}
