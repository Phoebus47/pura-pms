import * as crypto from 'node:crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { MarkNoShowDto } from './dto/mark-no-show.dto';
import { WalkReservationDto } from './dto/walk-reservation.dto';
import {
  Prisma,
  ReservationStatus,
  RoomStatus,
  BillingCycle,
  StayPurpose,
} from '@pura/database';
import { FoliosService } from '../folios/folios.service';
import { mapHeaderReservation, mapStayOccupancy } from './reservation-calendar';
import {
  reservationDetailInclude,
  reservationListInclude,
  reservationMutationInclude,
} from './reservation-include';
import {
  buildRoomConflictWhere,
  buildStaySegmentConflictWhere,
  calculateNights,
  calculateSplitStayTotal,
  calculateStayTotal,
  splitStayError,
  stayDatesError,
  type SplitStayDraft,
} from './reservation-stay.util';
import {
  assertRoomMoveAllowed,
  occupancyWindowForMove,
  occupiedStatusForVacant,
} from './room-move';
import {
  assertCanMarkNoShow,
  NO_SHOW_TRX_CODE,
  noShowChargeAmount,
} from './no-show';
import { assertCanWalk, assertWalkAmountsValid } from './walk';
import {
  assertCanChangeStayPurpose,
  assertStayPurposeFields,
  defaultRateCodeForPurpose,
  isNonRevenueStay,
  zeroNonRevenueAmount,
} from './stay-purpose';
import {
  calculateExtendedStayTotal,
  isExtendedBillingCycle,
} from './billing-cycle';
import { assertBillingCycleCompatible } from './billing-cycle-guards';
import {
  assertCanChangeTaxExempt,
  assertTaxExemptFields,
} from './tax-exemption';
import {
  assertRoomChangeAllowed,
  assertRoomLockCompatible,
  assertRoomLockFields,
  reservationRoomChanging,
} from './room-lock';

const SPLIT_DATE_PATCH_ERROR =
  'Split stay date or room changes must include the full stays array';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly foliosService: FoliosService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const checkIn = new Date(createReservationDto.checkIn);
    const checkOut = new Date(createReservationDto.checkOut);
    const isDayUse = createReservationDto.isDayUse === true;
    const stayPurpose =
      createReservationDto.stayPurpose ?? StayPurpose.STANDARD;
    const billingCycle =
      createReservationDto.billingCycle ?? BillingCycle.NIGHTLY;
    assertStayPurposeFields({
      stayPurpose,
      approvedBy: createReservationDto.approvedBy,
      department: createReservationDto.department,
    });
    const taxExempt = createReservationDto.taxExempt === true;
    assertTaxExemptFields({
      taxExempt,
      taxExemptReason: createReservationDto.taxExemptReason,
      taxExemptDocumentRef: createReservationDto.taxExemptDocumentRef,
      taxExemptApprovedBy: createReservationDto.taxExemptApprovedBy,
    });
    const isRoomLocked = createReservationDto.isRoomLocked === true;
    assertRoomLockFields({
      isRoomLocked,
      roomLockNote: createReservationDto.roomLockNote,
    });

    const nights = calculateNights(checkIn, checkOut, isDayUse);
    const staysInput = createReservationDto.stays ?? [];
    assertBillingCycleCompatible(billingCycle, isDayUse, staysInput.length);
    assertRoomLockCompatible(isRoomLocked, staysInput.length);

    const datesError = stayDatesError(checkIn, checkOut, isDayUse);
    if (datesError) {
      throw new BadRequestException(datesError);
    }

    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    const room = await this.prisma.room.findUnique({
      where: { id: createReservationDto.roomId },
      include: { roomType: true },
    });

    if (!room) {
      throw new NotFoundException(
        `Room with ID ${createReservationDto.roomId} not found`,
      );
    }

    const guest = await this.prisma.guest.findUnique({
      where: { id: createReservationDto.guestId },
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with ID ${createReservationDto.guestId} not found`,
      );
    }

    const stayDrafts = createReservationDto.stays?.length
      ? await this.resolveStayDrafts(
          createReservationDto.stays,
          room.propertyId,
        )
      : [];
    const pricedStays = isNonRevenueStay(stayPurpose)
      ? stayDrafts.map((stay) => ({
          ...stay,
          roomRate: 0,
          rateCode:
            stay.rateCode ??
            defaultRateCodeForPurpose(
              stayPurpose,
              createReservationDto.rateCode,
            ),
        }))
      : stayDrafts;

    const splitError = splitStayError(
      checkIn,
      checkOut,
      isDayUse,
      createReservationDto.roomId,
      pricedStays,
    );
    if (splitError) {
      throw new BadRequestException(splitError);
    }

    await this.assertRoomsAvailable(
      stayDrafts.length > 0
        ? stayDrafts.map((stay) => ({
            roomId: stay.roomId,
            startDate: stay.startDate,
            endDate: stay.endDate,
            isDayUse: false,
          }))
        : [
            {
              roomId: createReservationDto.roomId,
              startDate: checkIn,
              endDate: checkOut,
              isDayUse,
            },
          ],
    );

    const billedRate = zeroNonRevenueAmount(
      stayPurpose,
      pricedStays.length > 0
        ? pricedStays[0].roomRate
        : Number(createReservationDto.roomRate),
    );
    const totalAmount = zeroNonRevenueAmount(
      stayPurpose,
      pricedStays.length > 0
        ? (createReservationDto.totalAmount ??
            calculateSplitStayTotal(pricedStays))
        : isExtendedBillingCycle(billingCycle)
          ? (createReservationDto.totalAmount ??
            calculateExtendedStayTotal(
              nights,
              Number(createReservationDto.roomRate),
              billingCycle,
              isDayUse,
            ))
          : calculateStayTotal(
              nights,
              Number(createReservationDto.roomRate),
              isDayUse,
              createReservationDto.totalAmount,
            ),
    );
    const rateCode =
      defaultRateCodeForPurpose(stayPurpose, createReservationDto.rateCode) ??
      pricedStays[0]?.rateCode;

    const confirmNumber = this.generateConfirmNumber();
    const splitNights =
      pricedStays.length > 0
        ? pricedStays.reduce(
            (sum, stay) =>
              sum + calculateNights(stay.startDate, stay.endDate, false),
            0,
          )
        : nights;

    const reservation = await this.prisma.reservation.create({
      data: {
        confirmNumber,
        checkIn,
        checkOut,
        nights: splitNights,
        adults: createReservationDto.adults,
        children: createReservationDto.children || 0,
        status: createReservationDto.status || ReservationStatus.CONFIRMED,
        source: createReservationDto.source,
        rateCode,
        roomRate: billedRate,
        totalAmount,
        notes: createReservationDto.notes,
        specialRequest: createReservationDto.specialRequest,
        isDayUse,
        stayPurpose,
        approvedBy: createReservationDto.approvedBy,
        stayPurposeNote: createReservationDto.stayPurposeNote,
        department: createReservationDto.department,
        billingCycle: isDayUse ? BillingCycle.NIGHTLY : billingCycle,
        taxExempt,
        taxExemptReason: taxExempt
          ? createReservationDto.taxExemptReason
          : undefined,
        taxExemptDocumentRef: taxExempt
          ? createReservationDto.taxExemptDocumentRef
          : undefined,
        taxExemptApprovedBy: taxExempt
          ? createReservationDto.taxExemptApprovedBy
          : undefined,
        isRoomLocked,
        roomLockNote: isRoomLocked
          ? createReservationDto.roomLockNote
          : undefined,
        roomId: createReservationDto.roomId,
        guestId: createReservationDto.guestId,
        stays:
          pricedStays.length > 0
            ? {
                create: pricedStays.map((stay, sequence) => ({
                  sequence,
                  startDate: stay.startDate,
                  endDate: stay.endDate,
                  nights: calculateNights(stay.startDate, stay.endDate, false),
                  roomId: stay.roomId,
                  roomTypeId: stay.roomTypeId,
                  roomRate: stay.roomRate,
                  rateCode: stay.rateCode,
                })),
              }
            : undefined,
      },
      include: reservationMutationInclude,
    });

    await this.prisma.guest.update({
      where: { id: createReservationDto.guestId },
      data: {
        totalStays: { increment: 1 },
        totalRevenue: { increment: totalAmount },
      },
    });

    return reservation;
  }

  async findAll(
    propertyId?: string,
    status?: ReservationStatus,
    checkIn?: Date,
    checkOut?: Date,
    guestId?: string,
    stayPurpose?: StayPurpose,
    taxExempt?: boolean,
    isRoomLocked?: boolean,
  ) {
    const where: Prisma.ReservationWhereInput = {};

    if (propertyId) {
      where.room = { propertyId };
    }

    if (status) {
      where.status = status;
    }

    if (stayPurpose) {
      where.stayPurpose = stayPurpose;
    }

    if (taxExempt !== undefined) {
      where.taxExempt = taxExempt;
    }

    if (isRoomLocked !== undefined) {
      where.isRoomLocked = isRoomLocked;
    }

    if (checkIn || checkOut) {
      const orFilter: Prisma.ReservationWhereInput[] = [];
      if (checkIn) {
        orFilter.push({
          checkIn: { gte: checkIn },
        });
      }
      if (checkOut) {
        orFilter.push({
          checkOut: { lte: checkOut },
        });
      }

      where.OR = orFilter;
    }

    if (guestId) {
      where.guestId = guestId;
    }

    return this.prisma.reservation.findMany({
      where,
      include: reservationListInclude,
      orderBy: {
        checkIn: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: reservationDetailInclude,
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByConfirmNumber(confirmNumber: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { confirmNumber },
      include: reservationDetailInclude,
    });

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with confirmation number ${confirmNumber} not found`,
      );
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);
    const {
      stays: staysInput,
      roomId: dtoRoomId,
      ...scalarDto
    } = updateReservationDto;
    const existingStays = reservation.stays ?? [];
    const isDayUse = updateReservationDto.isDayUse ?? reservation.isDayUse;
    const currentPurpose = reservation.stayPurpose ?? StayPurpose.STANDARD;
    const stayPurpose = updateReservationDto.stayPurpose ?? currentPurpose;
    assertCanChangeStayPurpose(
      reservation.status,
      currentPurpose,
      updateReservationDto.stayPurpose,
    );
    assertStayPurposeFields({
      stayPurpose,
      approvedBy: updateReservationDto.approvedBy ?? reservation.approvedBy,
      department: updateReservationDto.department ?? reservation.department,
    });
    const taxExempt = updateReservationDto.taxExempt ?? reservation.taxExempt;
    assertCanChangeTaxExempt(
      reservation.status,
      reservation.taxExempt,
      updateReservationDto.taxExempt,
    );
    assertTaxExemptFields({
      taxExempt,
      taxExemptReason:
        updateReservationDto.taxExemptReason ?? reservation.taxExemptReason,
      taxExemptDocumentRef:
        updateReservationDto.taxExemptDocumentRef ??
        reservation.taxExemptDocumentRef,
      taxExemptApprovedBy:
        updateReservationDto.taxExemptApprovedBy ??
        reservation.taxExemptApprovedBy,
    });
    const isRoomLocked =
      updateReservationDto.isRoomLocked ?? reservation.isRoomLocked;
    assertRoomLockFields({
      isRoomLocked,
      roomLockNote:
        updateReservationDto.roomLockNote ?? reservation.roomLockNote,
    });
    const unlocking =
      reservation.isRoomLocked && updateReservationDto.isRoomLocked === false;
    const stayDatesChanged = Boolean(
      updateReservationDto.checkIn ||
      updateReservationDto.checkOut ||
      updateReservationDto.isDayUse !== undefined ||
      dtoRoomId,
    );

    if (
      staysInput === undefined &&
      existingStays.length > 0 &&
      stayDatesChanged
    ) {
      throw new BadRequestException(SPLIT_DATE_PATCH_ERROR);
    }

    const checkIn = updateReservationDto.checkIn
      ? new Date(updateReservationDto.checkIn)
      : reservation.checkIn;
    const checkOut = updateReservationDto.checkOut
      ? new Date(updateReservationDto.checkOut)
      : reservation.checkOut;

    const stayDrafts =
      staysInput && staysInput.length > 0
        ? await this.resolveStayDrafts(staysInput, reservation.room.propertyId)
        : [];
    const nonRevenueRateCode = defaultRateCodeForPurpose(
      stayPurpose,
      updateReservationDto.rateCode ?? reservation.rateCode,
    );
    const pricedStays = isNonRevenueStay(stayPurpose)
      ? stayDrafts.map((stay) => ({
          ...stay,
          roomRate: 0,
          rateCode: stay.rateCode ?? nonRevenueRateCode,
        }))
      : stayDrafts;
    const headerRoomId =
      pricedStays.length > 0
        ? pricedStays[0].roomId
        : (dtoRoomId ?? reservation.roomId);

    if (staysInput !== undefined) {
      const splitError = splitStayError(
        checkIn,
        checkOut,
        isDayUse,
        headerRoomId,
        pricedStays,
      );
      if (splitError) {
        throw new BadRequestException(splitError);
      }
    }

    const billingCycle =
      updateReservationDto.billingCycle ??
      reservation.billingCycle ??
      BillingCycle.NIGHTLY;
    assertBillingCycleCompatible(
      billingCycle,
      isDayUse,
      staysInput !== undefined ? pricedStays.length : existingStays.length,
    );
    assertRoomLockCompatible(
      isRoomLocked,
      staysInput !== undefined ? pricedStays.length : existingStays.length,
    );

    const datesError = stayDatesError(checkIn, checkOut, isDayUse);
    if (stayDatesChanged && datesError) {
      throw new BadRequestException(datesError);
    }

    const roomChanging = reservationRoomChanging(
      reservation.roomId,
      dtoRoomId,
      existingStays.map((stay, sequence) => ({
        sequence: stay.sequence ?? sequence,
        roomId: stay.roomId,
      })),
      pricedStays.map((stay, sequence) => ({
        sequence,
        roomId: stay.roomId,
      })),
    );
    assertRoomChangeAllowed(isRoomLocked, unlocking, roomChanging);

    if (stayDatesChanged || staysInput !== undefined) {
      await this.assertRoomsAvailable(
        pricedStays.length > 0
          ? pricedStays.map((stay) => ({
              roomId: stay.roomId,
              startDate: stay.startDate,
              endDate: stay.endDate,
              isDayUse: false,
            }))
          : [
              {
                roomId: headerRoomId,
                startDate: checkIn,
                endDate: checkOut,
                isDayUse,
              },
            ],
        id,
      );
    }

    const nights = calculateNights(checkIn, checkOut, isDayUse);
    const roomRate =
      pricedStays.length > 0
        ? pricedStays[0].roomRate
        : (updateReservationDto.roomRate ?? Number(reservation.roomRate));
    const totalAmount =
      pricedStays.length > 0
        ? (updateReservationDto.totalAmount ??
          calculateSplitStayTotal(pricedStays))
        : stayDatesChanged || updateReservationDto.billingCycle !== undefined
          ? isExtendedBillingCycle(billingCycle)
            ? (updateReservationDto.totalAmount ??
              calculateExtendedStayTotal(
                nights,
                Number(roomRate),
                billingCycle,
                isDayUse,
              ))
            : calculateStayTotal(nights, Number(roomRate), isDayUse)
          : undefined;

    const updateData: Prisma.ReservationUpdateInput = {
      ...scalarDto,
    };

    if (stayDatesChanged) {
      updateData.nights = nights;
      updateData.isDayUse = isDayUse;
      if (totalAmount !== undefined) {
        updateData.totalAmount = totalAmount;
      }
    }

    if (staysInput !== undefined && pricedStays.length > 0) {
      updateData.nights = pricedStays.reduce(
        (sum, stay) =>
          sum + calculateNights(stay.startDate, stay.endDate, false),
        0,
      );
      updateData.roomRate = pricedStays[0].roomRate;
      updateData.rateCode = pricedStays[0].rateCode;
      updateData.totalAmount =
        updateReservationDto.totalAmount ??
        calculateSplitStayTotal(pricedStays);
      updateData.room = { connect: { id: pricedStays[0].roomId } };
    }

    if (staysInput !== undefined && pricedStays.length === 0) {
      updateData.nights = nights;
      updateData.totalAmount = isExtendedBillingCycle(billingCycle)
        ? calculateExtendedStayTotal(
            nights,
            Number(roomRate),
            billingCycle,
            isDayUse,
          )
        : calculateStayTotal(nights, Number(roomRate), isDayUse);
    }

    if (updateReservationDto.billingCycle !== undefined || stayDatesChanged) {
      updateData.billingCycle = isDayUse ? BillingCycle.NIGHTLY : billingCycle;
    }

    if (isNonRevenueStay(stayPurpose)) {
      updateData.stayPurpose = stayPurpose;
      updateData.roomRate = 0;
      updateData.totalAmount = 0;
      updateData.rateCode = nonRevenueRateCode;
    }

    if (updateReservationDto.taxExempt === false) {
      updateData.taxExempt = false;
      updateData.taxExemptReason = null;
      updateData.taxExemptDocumentRef = null;
      updateData.taxExemptApprovedBy = null;
    }

    if (updateReservationDto.isRoomLocked === false) {
      updateData.isRoomLocked = false;
      updateData.roomLockNote = null;
    }

    if (updateReservationDto.isRoomLocked === true) {
      updateData.isRoomLocked = true;
      updateData.roomLockNote =
        updateReservationDto.roomLockNote ?? reservation.roomLockNote;
    }

    return this.persistReservationUpdate(
      id,
      {
        ...updateData,
        checkIn: updateReservationDto.checkIn ? checkIn : undefined,
        checkOut: updateReservationDto.checkOut ? checkOut : undefined,
      },
      staysInput === undefined ? null : pricedStays,
      isNonRevenueStay(stayPurpose),
    );
  }

  async cancel(id: string, reason?: string) {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    if (reservation.status === ReservationStatus.CHECKED_OUT) {
      throw new BadRequestException('Cannot cancel a checked-out reservation');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CANCELLED,
        notes: reason
          ? `${reservation.notes || ''}\nCancelled: ${reason}`.trim()
          : reservation.notes,
      },
      include: reservationMutationInclude,
    });
  }

  async markNoShow(id: string, dto: MarkNoShowDto) {
    const reservation = await this.findOne(id);
    const asOf = dto.businessDate
      ? new Date(dto.businessDate)
      : (reservation.room.property.businessDate ?? new Date());
    assertCanMarkNoShow(reservation, asOf);

    const trxCode = await this.prisma.transactionCode.findUnique({
      where: { code: NO_SHOW_TRX_CODE },
    });
    if (!trxCode) {
      throw new BadRequestException(
        'No-show transaction code 1006 is not configured',
      );
    }

    let folios = await this.foliosService.findByReservationId(id);
    if (folios.length === 0) {
      await this.foliosService.create({
        reservationId: id,
        type: 'GUEST',
      });
      folios = await this.foliosService.findByReservationId(id);
    }

    const folio = folios[0];
    if (!folio) {
      throw new BadRequestException('Could not create a folio for no-show');
    }

    const alreadyPosted = await this.prisma.folioTransaction.findFirst({
      where: {
        trxCodeId: trxCode.id,
        isVoid: false,
        window: { folio: { reservationId: id } },
      },
    });

    if (!alreadyPosted) {
      const reasonCode = await this.prisma.reasonCode.findUnique({
        where: { code: 'NS-001' },
      });
      await this.foliosService.postTransaction(folio.id, {
        windowNumber: 1,
        trxCodeId: trxCode.id,
        amountNet: noShowChargeAmount(reservation.roomRate),
        reference: `No-show ${reservation.confirmNumber}`,
        remark: dto.reason,
        userId: dto.userId,
        reasonCodeId: reasonCode?.id,
        businessDate: asOf.toISOString(),
      });
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.NO_SHOW,
        notes: dto.reason
          ? `${reservation.notes || ''}\nNo-show: ${dto.reason}`.trim()
          : reservation.notes,
      },
      include: reservationMutationInclude,
    });
  }

  async checkIn(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed reservations can be checked in',
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: reservationMutationInclude,
    });

    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'OCCUPIED_CLEAN' },
    });

    const existingFolios = await this.foliosService.findByReservationId(id);
    if (existingFolios.length === 0) {
      await this.foliosService.create({
        reservationId: id,
        type: 'GUEST',
      });
    }

    return updated;
  }

  async checkOut(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Only checked-in reservations can be checked out',
      );
    }

    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CHECKED_OUT,
        checkedOutAt: new Date(),
      },
      include: reservationMutationInclude,
    });

    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'VACANT_DIRTY' },
    });

    return updated;
  }

  async moveRoom(id: string, dto: MoveRoomDto) {
    const reservation = await this.findOne(id);
    const toRoom = await this.prisma.room.findUnique({
      where: { id: dto.toRoomId },
    });
    const target = assertRoomMoveAllowed(
      reservation,
      reservation.room.propertyId,
      toRoom,
      dto.toRoomId,
    );
    const window = occupancyWindowForMove(reservation);

    await this.assertRoomsAvailable(
      [
        {
          roomId: dto.toRoomId,
          startDate: window.startDate,
          endDate: window.endDate,
          isDayUse: window.isDayUse,
        },
      ],
      id,
    );

    const fromRoomId = reservation.roomId;
    const occupiedStatus = occupiedStatusForVacant(target.status);

    return this.prisma.$transaction(async (tx) => {
      if (window.stayId) {
        await tx.reservationStay.update({
          where: { id: window.stayId },
          data: {
            roomId: dto.toRoomId,
            roomTypeId: target.roomTypeId,
          },
        });
      }

      await tx.room.update({
        where: { id: fromRoomId },
        data: { status: RoomStatus.VACANT_DIRTY },
      });
      await tx.room.update({
        where: { id: dto.toRoomId },
        data: { status: occupiedStatus },
      });
      await tx.roomMove.create({
        data: {
          reservationId: id,
          fromRoomId,
          toRoomId: dto.toRoomId,
          reason: dto.reason,
          movedBy: dto.movedBy,
        },
      });

      return tx.reservation.update({
        where: { id },
        data: { room: { connect: { id: dto.toRoomId } } },
        include: reservationMutationInclude,
      });
    });
  }

  async listRoomMoves(id: string) {
    await this.findOne(id);

    return this.prisma.roomMove.findMany({
      where: { reservationId: id },
      include: {
        fromRoom: { select: { id: true, number: true } },
        toRoom: { select: { id: true, number: true } },
      },
      orderBy: { movedAt: 'desc' },
    });
  }

  async walk(id: string, dto: WalkReservationDto) {
    const reservation = await this.findOne(id);
    assertCanWalk(reservation);

    const cost = Number(dto.cost);
    const compensationAmount = Number(dto.compensationAmount ?? 0);
    assertWalkAmountsValid(cost, compensationAmount);

    const partnerHotel = await this.prisma.partnerHotel.findUnique({
      where: { id: dto.partnerHotelId },
    });
    if (!partnerHotel) {
      throw new NotFoundException(
        `Partner hotel with ID ${dto.partnerHotelId} not found`,
      );
    }
    if (partnerHotel.propertyId !== reservation.room.propertyId) {
      throw new BadRequestException(
        'Partner hotel does not belong to this property',
      );
    }
    if (!partnerHotel.isActive) {
      throw new BadRequestException('Partner hotel is not active');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.walk.create({
        data: {
          reservationId: id,
          partnerHotelId: dto.partnerHotelId,
          reason: dto.reason,
          cost,
          compensationAmount,
          compensationNotes: dto.compensationNotes,
          walkedBy: dto.walkedBy,
        },
      });

      return tx.reservation.update({
        where: { id },
        data: {
          status: ReservationStatus.WALKED,
          notes: dto.reason
            ? `${reservation.notes || ''}\nWalked: ${dto.reason}`.trim()
            : reservation.notes,
        },
        include: reservationMutationInclude,
      });
    });
  }

  async listWalks(id: string) {
    await this.findOne(id);

    return this.prisma.walk.findMany({
      where: { reservationId: id },
      include: {
        partnerHotel: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { walkedAt: 'desc' },
    });
  }

  async getCalendar(
    propertyId: string,
    startDate: Date,
    endDate: Date,
    roomTypeId?: string,
  ) {
    const roomWhere: Prisma.RoomWhereInput = { propertyId };
    if (roomTypeId) {
      roomWhere.roomTypeId = roomTypeId;
    }

    const rooms = await this.prisma.room.findMany({
      where: roomWhere,
      include: {
        roomType: true,
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });

    const roomIds = rooms.map((room) => room.id);
    const activeStatus = {
      notIn: ['CANCELLED', 'NO_SHOW'] as ReservationStatus[],
    };

    const headerReservations = await this.prisma.reservation.findMany({
      where: {
        roomId: { in: roomIds },
        stays: { none: {} },
        status: activeStatus,
        checkIn: { lte: endDate },
        checkOut: { gte: startDate },
      },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        checkIn: 'asc',
      },
    });

    const stayRows = await this.prisma.reservationStay.findMany({
      where: {
        roomId: { in: roomIds },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        reservation: { status: activeStatus },
      },
      include: {
        reservation: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const calendar = rooms.map((room) => {
      const headerItems = headerReservations
        .filter((res) => res.roomId === room.id)
        .map(mapHeaderReservation);
      const stayItems = stayRows
        .filter((stay) => stay.roomId === room.id)
        .map(mapStayOccupancy);

      return {
        room: {
          id: room.id,
          number: room.number,
          floor: room.floor,
          status: room.status,
          roomType: room.roomType,
        },
        reservations: [...headerItems, ...stayItems],
      };
    });

    return {
      startDate,
      endDate,
      calendar,
      totalRooms: rooms.length,
      totalReservations: headerReservations.length + stayRows.length,
    };
  }

  private async persistReservationUpdate(
    id: string,
    data: Prisma.ReservationUpdateInput,
    stayDrafts: SplitStayDraft[] | null,
    zeroStayRates = false,
  ) {
    if (stayDrafts === null && !zeroStayRates) {
      return this.prisma.reservation.update({
        where: { id },
        data,
        include: reservationMutationInclude,
      });
    }

    return this.prisma.$transaction(async (tx) => {
      if (stayDrafts === null && zeroStayRates) {
        await tx.reservationStay.updateMany({
          where: { reservationId: id },
          data: { roomRate: 0 },
        });
        return tx.reservation.update({
          where: { id },
          data,
          include: reservationMutationInclude,
        });
      }

      await tx.reservationStay.deleteMany({ where: { reservationId: id } });
      if (stayDrafts && stayDrafts.length > 0) {
        await tx.reservationStay.createMany({
          data: stayDrafts.map((stay, sequence) => ({
            reservationId: id,
            sequence,
            startDate: stay.startDate,
            endDate: stay.endDate,
            nights: calculateNights(stay.startDate, stay.endDate, false),
            roomId: stay.roomId,
            roomTypeId: stay.roomTypeId,
            roomRate: stay.roomRate,
            rateCode: stay.rateCode,
          })),
        });
      }

      return tx.reservation.update({
        where: { id },
        data,
        include: reservationMutationInclude,
      });
    });
  }

  private async resolveStayDrafts(
    stays: NonNullable<CreateReservationDto['stays']>,
    propertyId?: string,
  ): Promise<SplitStayDraft[]> {
    const drafts: SplitStayDraft[] = [];

    for (const stay of stays) {
      const room = await this.prisma.room.findUnique({
        where: { id: stay.roomId },
        include: { roomType: true },
      });

      if (!room) {
        throw new NotFoundException(`Room with ID ${stay.roomId} not found`);
      }

      if (propertyId && room.propertyId && room.propertyId !== propertyId) {
        throw new BadRequestException(
          'Stay segment rooms must belong to the same property',
        );
      }

      drafts.push({
        startDate: new Date(stay.startDate),
        endDate: new Date(stay.endDate),
        roomId: stay.roomId,
        roomTypeId: room.roomTypeId,
        roomRate: stay.roomRate,
        rateCode: stay.rateCode,
      });
    }

    return drafts;
  }

  private async assertRoomsAvailable(
    windows: Array<{
      roomId: string;
      startDate: Date;
      endDate: Date;
      isDayUse: boolean;
    }>,
    excludeReservationId?: string,
  ): Promise<void> {
    for (const window of windows) {
      const headerConflicts = await this.prisma.reservation.findMany({
        where: buildRoomConflictWhere(
          window.roomId,
          window.startDate,
          window.endDate,
          window.isDayUse,
          excludeReservationId,
        ),
      });

      if (headerConflicts.length > 0) {
        throw new ConflictException(
          'Room is not available for the selected dates',
        );
      }

      const stayConflicts = await this.prisma.reservationStay.findMany({
        where: buildStaySegmentConflictWhere(
          window.roomId,
          window.startDate,
          window.endDate,
          excludeReservationId,
        ),
      });

      if (stayConflicts.length > 0) {
        throw new ConflictException(
          'Room is not available for the selected dates',
        );
      }
    }
  }

  private generateConfirmNumber(): string {
    const prefix = 'PURA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()
      .substring(0, 4);
    return `${prefix}-${timestamp}-${random}`;
  }
}
