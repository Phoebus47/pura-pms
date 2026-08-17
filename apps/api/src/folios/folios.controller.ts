import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FoliosService } from './folios.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { FindFoliosQueryDto } from './dto/find-folios-query.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import {
  CheckoutFolioDto,
  SetArAccountDto,
  SetCreditLimitDto,
} from './dto/credit-limit.dto';

@Controller('folios')
export class FoliosController {
  constructor(private readonly foliosService: FoliosService) {}

  @Post()
  create(@Body() createFolioDto: CreateFolioDto) {
    return this.foliosService.create(createFolioDto);
  }

  @Get()
  findMany(@Query() query: FindFoliosQueryDto) {
    return this.foliosService.findMany(query);
  }

  @Get('reservation/:reservationId')
  findByReservationId(@Param('reservationId') reservationId: string) {
    return this.foliosService.findByReservationId(reservationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foliosService.findOne(id);
  }

  @Post(':id/transactions')
  postTransaction(
    @Param('id') id: string,
    @Body() postTransactionDto: PostTransactionDto,
  ) {
    return this.foliosService.postTransaction(id, postTransactionDto);
  }

  @Post(':id/checkout')
  checkout(@Param('id') id: string, @Body() dto: CheckoutFolioDto) {
    return this.foliosService.checkout(id, dto.userId);
  }

  @Post(':id/reopen')
  reopen(@Param('id') id: string) {
    return this.foliosService.reopen(id);
  }

  @Patch(':id/credit-limit')
  setCreditLimit(@Param('id') id: string, @Body() dto: SetCreditLimitDto) {
    return this.foliosService.setCreditLimit(id, dto.creditLimit);
  }

  @Patch(':id/ar-account')
  setArAccount(@Param('id') id: string, @Body() dto: SetArAccountDto) {
    return this.foliosService.setArAccount(id, dto.arAccountId);
  }

  @Post('transactions/:transactionId/void')
  voidTransaction(
    @Param('transactionId') transactionId: string,
    @Body() voidTransactionDto: VoidTransactionDto,
  ) {
    return this.foliosService.voidTransaction(
      transactionId,
      voidTransactionDto,
    );
  }
}
