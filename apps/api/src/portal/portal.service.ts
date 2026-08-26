import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationsService } from '../reservations/reservations.service';
import { FoliosService } from '../folios/folios.service';
import { GuestMessagesService } from '../guest-messages/guest-messages.service';
import { guestLastNameMatches, PORTAL_NOT_FOUND } from './portal-auth';
import { CreatePortalMessageDto } from './dto/portal.dto';

@Injectable()
export class PortalService {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly foliosService: FoliosService,
    private readonly guestMessagesService: GuestMessagesService,
  ) {}

  private async verifyReservation(confirmNumber: string, lastName: string) {
    const reservation = await this.reservationsService.findByConfirmNumber(
      confirmNumber.trim(),
    );
    if (!guestLastNameMatches(reservation.guest?.lastName, lastName)) {
      throw new NotFoundException(PORTAL_NOT_FOUND);
    }
    return reservation;
  }

  async getReservationSummary(confirmNumber: string, lastName: string) {
    const reservation = await this.verifyReservation(confirmNumber, lastName);
    return {
      id: reservation.id,
      confirmNumber: reservation.confirmNumber,
      status: reservation.status,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      nights: reservation.nights,
      room: reservation.room ? { number: reservation.room.number } : null,
      guest: reservation.guest
        ? {
            firstName: reservation.guest.firstName,
            lastName: reservation.guest.lastName,
          }
        : null,
    };
  }

  async getFolioSummary(confirmNumber: string, lastName: string) {
    const reservation = await this.verifyReservation(confirmNumber, lastName);
    const folios = await this.foliosService.findByReservationId(reservation.id);

    return folios.map((folio) => ({
      id: folio.id,
      folioNumber: folio.folioNumber,
      status: folio.status,
      balance: folio.balance,
      transactions: folio.windows.flatMap((window) =>
        window.transactions
          .filter((trx) => !trx.isVoid)
          .map((trx) => ({
            id: trx.id,
            businessDate: trx.businessDate,
            description: trx.trxCode?.description ?? trx.remark ?? '',
            amountTotal: trx.amountTotal,
            sign: trx.sign,
          })),
      ),
    }));
  }

  async createServiceRequest(
    confirmNumber: string,
    dto: CreatePortalMessageDto,
  ) {
    const reservation = await this.verifyReservation(
      confirmNumber,
      dto.lastName,
    );
    const propertyId = reservation.room?.propertyId;
    if (!propertyId) {
      throw new NotFoundException(PORTAL_NOT_FOUND);
    }

    return this.guestMessagesService.create({
      propertyId,
      guestId: reservation.guestId,
      reservationId: reservation.id,
      direction: 'INBOUND',
      channel: 'IN_APP',
      content: dto.content,
    });
  }
}
