import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FoliosService } from './folios.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { PostTransactionDto } from './dto/post-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';

@Controller('folios')
export class FoliosController {
  constructor(private readonly foliosService: FoliosService) {}

  @Post()
  create(@Body() createFolioDto: CreateFolioDto) {
    return this.foliosService.create(createFolioDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foliosService.findOne(id);
  }

  @Get('reservation/:reservationId')
  findByReservationId(@Param('reservationId') reservationId: string) {
    return this.foliosService.findByReservationId(reservationId);
  }

  @Post(':id/transactions')
  postTransaction(
    @Param('id') id: string,
    @Body() postTransactionDto: PostTransactionDto,
  ) {
    return this.foliosService.postTransaction(id, postTransactionDto);
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
