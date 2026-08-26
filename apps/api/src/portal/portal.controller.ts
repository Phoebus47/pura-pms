import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PortalService } from './portal.service';
import { CreatePortalMessageDto, VerifyGuestQueryDto } from './dto/portal.dto';

/**
 * Public guest-facing routes (no JWT). Every route requires the guest to
 * present the reservation's confirmNumber plus the guest's lastName; see
 * docs/adr/020-guest-portal.md for the auth rationale.
 */
@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Get('reservations/:confirmNumber')
  getReservation(
    @Param('confirmNumber') confirmNumber: string,
    @Query() query: VerifyGuestQueryDto,
  ) {
    return this.portalService.getReservationSummary(
      confirmNumber,
      query.lastName,
    );
  }

  @Get('reservations/:confirmNumber/folio')
  getFolio(
    @Param('confirmNumber') confirmNumber: string,
    @Query() query: VerifyGuestQueryDto,
  ) {
    return this.portalService.getFolioSummary(confirmNumber, query.lastName);
  }

  @Post('reservations/:confirmNumber/messages')
  @HttpCode(HttpStatus.CREATED)
  createMessage(
    @Param('confirmNumber') confirmNumber: string,
    @Body() dto: CreatePortalMessageDto,
  ) {
    return this.portalService.createServiceRequest(confirmNumber, dto);
  }
}
