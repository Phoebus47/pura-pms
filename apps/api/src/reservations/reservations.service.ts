import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Prisma, ReservationStatus } from '@pura/database';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(createReservationDto: CreateReservationDto) {
    const checkIn = new Date(createReservationDto.checkIn);
    const checkOut = new Date(createReservationDto.checkOut);

    // Validate dates
    if (checkIn >= checkOut) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }

    if (checkIn < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Calculate nights
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Check if room exists
    const room = await this.prisma.room.findUnique({
      where: { id: createReservationDto.roomId },
      include: { roomType: true },
    });

    if (!room) {
      throw new NotFoundException(
        `Room with ID ${createReservationDto.roomId} not found`,
      );
    }

    // Check if guest exists
    const guest = await this.prisma.guest.findUnique({
      where: { id: createReservationDto.guestId },
    });

    if (!guest) {
      throw new NotFoundException(
        `Guest with ID ${createReservationDto.guestId} not found`,
      );
    }

    // Check room availability
    const conflictingReservations = await this.prisma.reservation.findMany({
      where: {
        roomId: createReservationDto.roomId,
        AND: [
          {
            checkIn: {
              lt: checkOut,
            },
          },
          {
            checkOut: {
              gt: checkIn,
            },
          },
          {
            status: {
              notIn: ['CANCELLED', 'NO_SHOW'],
            },
          },
        ],
      },
    });

    if (conflictingReservations.length > 0) {
      throw new ConflictException(
        'Room is not available for the selected dates',
      );
    }

    // Calculate total amount
    const totalAmount =
      createReservationDto.totalAmount ||
      nights * Number(createReservationDto.roomRate);

    // Generate confirmation number
    const confirmNumber = this.generateConfirmNumber();

    // Create reservation
    const reservation = await this.prisma.reservation.create({
      data: {
        confirmNumber,
        checkIn,
        checkOut,
        nights,
        adults: createReservationDto.adults,
        children: createReservationDto.children || 0,
        status: createReservationDto.status || ReservationStatus.CONFIRMED,
        source: createReservationDto.source,
        rateCode: createReservationDto.rateCode,
        roomRate: createReservationDto.roomRate,
        totalAmount,
        notes: createReservationDto.notes,
        specialRequest: createReservationDto.specialRequest,
        roomId: createReservationDto.roomId,
        guestId: createReservationDto.guestId,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
      },
    });

    // Update guest statistics
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
  ) {
    const where: Prisma.ReservationWhereInput = {};

    if (propertyId) {
      where.room = { propertyId };
    }

    if (status) {
      where.status = status;
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
      if (orFilter.length > 0) {
        where.OR = orFilter;
      }
    }

    if (guestId) {
      where.guestId = guestId;
    }

    return this.prisma.reservation.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        folios: {
          include: {
            _count: {
              select: {
                transactions: true,
              },
            },
          },
        },
      },
      orderBy: {
        checkIn: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            roomType: true,
            property: true,
          },
        },
        guest: true,
        folios: {
          include: {
            transactions: {
              orderBy: {
                postedAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByConfirmNumber(confirmNumber: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { confirmNumber },
      include: {
        room: {
          include: {
            roomType: true,
            property: true,
          },
        },
        guest: true,
        folios: {
          include: {
            transactions: {
              orderBy: {
                postedAt: 'desc',
              },
            },
          },
        },
      },
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
    const updateData: Prisma.ReservationUpdateInput = {
      ...updateReservationDto,
    };

    // If dates are being updated, check availability
    if (updateReservationDto.checkIn || updateReservationDto.checkOut) {
      const checkIn = updateReservationDto.checkIn
        ? new Date(updateReservationDto.checkIn)
        : reservation.checkIn;
      const checkOut = updateReservationDto.checkOut
        ? new Date(updateReservationDto.checkOut)
        : reservation.checkOut;

      if (checkIn >= checkOut) {
        throw new BadRequestException(
          'Check-out date must be after check-in date',
        );
      }

      // Check for conflicts (excluding current reservation)
      const conflictingReservations = await this.prisma.reservation.findMany({
        where: {
          roomId: reservation.roomId,
          id: { not: id },
          AND: [
            {
              checkIn: {
                lt: checkOut,
              },
            },
            {
              checkOut: {
                gt: checkIn,
              },
            },
            {
              status: {
                notIn: ['CANCELLED', 'NO_SHOW'],
              },
            },
          ],
        },
      });

      if (conflictingReservations.length > 0) {
        throw new ConflictException(
          'Room is not available for the selected dates',
        );
      }

      // Recalculate nights and total amount
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
      );
      const roomRate =
        updateReservationDto.roomRate || Number(reservation.roomRate);
      const totalAmount = nights * roomRate;

      updateData.nights = nights;
      updateData.totalAmount = totalAmount;
    }

    return this.prisma.reservation.update({
      where: { id },
      data: {
        ...updateData,
        checkIn: updateData.checkIn
          ? new Date(updateData.checkIn as string | Date)
          : undefined,
        checkOut: updateData.checkOut
          ? new Date(updateData.checkOut as string | Date)
          : undefined,
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
      },
    });
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
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
      },
    });
  }

  async checkIn(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Only confirmed reservations can be checked in',
      );
    }

    // Update reservation
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
      },
    });

    // Update room status
    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'OCCUPIED_CLEAN' },
    });

    return updated;
  }

  async checkOut(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CHECKED_IN) {
      throw new BadRequestException(
        'Only checked-in reservations can be checked out',
      );
    }

    // Update reservation
    const updated = await this.prisma.reservation.update({
      where: { id },
      data: {
        status: ReservationStatus.CHECKED_OUT,
        checkedOutAt: new Date(),
      },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        guest: true,
      },
    });

    // Update room status
    await this.prisma.room.update({
      where: { id: reservation.roomId },
      data: { status: 'VACANT_DIRTY' },
    });

    return updated;
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

    const where: Prisma.ReservationWhereInput = {
      room: roomWhere,
      AND: [
        {
          checkIn: {
            lte: endDate,
          },
        },
        {
          checkOut: {
            gte: startDate,
          },
        },
        {
          status: {
            notIn: ['CANCELLED', 'NO_SHOW'],
          },
        },
      ],
    };

    const reservations = await this.prisma.reservation.findMany({
      where,
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
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

    // Get all rooms for the property
    const availabilityRoomWhere: Prisma.RoomWhereInput = { propertyId };
    if (roomTypeId) availabilityRoomWhere.roomTypeId = roomTypeId;

    const rooms = await this.prisma.room.findMany({
      where: roomWhere,
      include: {
        roomType: true,
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });

    // Build calendar structure
    const calendar = rooms.map((room) => {
      const roomReservations = reservations.filter(
        (res) => res.roomId === room.id,
      );

      return {
        room: {
          id: room.id,
          number: room.number,
          floor: room.floor,
          status: room.status,
          roomType: room.roomType,
        },
        reservations: roomReservations.map((res) => ({
          id: res.id,
          confirmNumber: res.confirmNumber,
          checkIn: res.checkIn,
          checkOut: res.checkOut,
          nights: res.nights,
          status: res.status,
          guest: res.guest,
          roomRate: res.roomRate,
          totalAmount: res.totalAmount,
        })),
      };
    });

    return {
      startDate,
      endDate,
      calendar,
      totalRooms: rooms.length,
      totalReservations: reservations.length,
    };
  }

  private generateConfirmNumber(): string {
    const prefix = 'PURA';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
