import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Prisma, RoomStatus, RoomType } from '@pura/database';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createRoomDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createRoomDto.propertyId} not found`,
      );
    }

    const roomType = await this.prisma.roomType.findUnique({
      where: { id: createRoomDto.roomTypeId },
    });

    if (!roomType) {
      throw new NotFoundException(
        `Room type with ID ${createRoomDto.roomTypeId} not found`,
      );
    }

    const existing = await this.prisma.room.findUnique({
      where: {
        propertyId_number: {
          propertyId: createRoomDto.propertyId,
          number: createRoomDto.number,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Room number ${createRoomDto.number} already exists for this property`,
      );
    }

    return this.prisma.room.create({
      data: {
        ...createRoomDto,
        status: createRoomDto.status || RoomStatus.VACANT_CLEAN,
      },
      include: {
        roomType: true,
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(propertyId?: string, roomTypeId?: string, status?: RoomStatus) {
    const where: Prisma.RoomWhereInput = {};
    if (propertyId) where.propertyId = propertyId;
    if (roomTypeId) where.roomTypeId = roomTypeId;
    if (status) where.status = status;

    return this.prisma.room.findMany({
      where,
      include: {
        roomType: {
          select: {
            id: true,
            name: true,
            code: true,
            baseRate: true,
          },
        },
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
      orderBy: [{ floor: 'asc' }, { number: 'asc' }],
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        property: true,
        reservations: {
          where: {
            status: {
              in: ['CONFIRMED', 'CHECKED_IN'],
            },
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
        },
        housekeeping: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const room = await this.findOne(id);

    if (updateRoomDto.number && updateRoomDto.number !== room.number) {
      const existing = await this.prisma.room.findUnique({
        where: {
          propertyId_number: {
            propertyId: room.propertyId,
            number: updateRoomDto.number,
          },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Room number ${updateRoomDto.number} already exists for this property`,
        );
      }
    }

    return this.prisma.room.update({
      where: { id },
      data: updateRoomDto,
      include: {
        roomType: true,
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: RoomStatus) {
    await this.findOne(id);
    return this.prisma.room.update({
      where: { id },
      data: { status },
      include: {
        roomType: true,
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const activeReservations = await this.prisma.reservation.count({
      where: {
        roomId: id,
        status: {
          in: ['CONFIRMED', 'CHECKED_IN'],
        },
      },
    });

    if (activeReservations > 0) {
      throw new BadRequestException(
        'Cannot delete room with active reservations. Please check out or cancel reservations first.',
      );
    }

    return this.prisma.room.delete({
      where: { id },
    });
  }

  async getAvailability(
    propertyId: string,
    checkIn: Date,
    checkOut: Date,
    roomTypeId?: string,
  ) {
    const where: Prisma.RoomWhereInput = { propertyId };
    if (roomTypeId) where.roomTypeId = roomTypeId;

    const rooms = await this.prisma.room.findMany({
      where,
      include: {
        roomType: true,
        reservations: {
          where: {
            AND: [
              {
                checkIn: {
                  lt: new Date(checkOut),
                },
              },
              {
                checkOut: {
                  gt: new Date(checkIn),
                },
              },
              {
                status: {
                  notIn: ['CANCELLED', 'NO_SHOW'],
                },
              },
            ],
          },
        },
      },
    });

    const availableRooms = rooms.filter(
      (room) => room.reservations.length === 0,
    );

    const availabilityByType: Record<string, RoomAvailability> = {};

    for (const room of availableRooms) {
      const typeId = room.roomTypeId;
      if (!availabilityByType[typeId]) {
        availabilityByType[typeId] = {
          roomType: room.roomType,
          availableCount: 0,
          rooms: [],
        };
      }
      availabilityByType[typeId].availableCount++;
      availabilityByType[typeId].rooms.push({
        id: room.id,
        number: room.number,
        floor: room.floor,
        status: room.status,
      });
    }

    return {
      checkIn,
      checkOut,
      availability: Object.values(availabilityByType),
      totalAvailable: availableRooms.length,
    };
  }
}

export interface RoomAvailability {
  roomType: RoomType;
  availableCount: number;
  rooms: Array<{
    id: string;
    number: string;
    floor: number | null;
    status: RoomStatus;
  }>;
}
