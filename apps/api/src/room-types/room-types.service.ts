import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomTypeDto: CreateRoomTypeDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: createRoomTypeDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException(
        `Property with ID ${createRoomTypeDto.propertyId} not found`,
      );
    }

    const existing = await this.prisma.roomType.findFirst({
      where: {
        propertyId: createRoomTypeDto.propertyId,
        code: createRoomTypeDto.code,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Room type with code ${createRoomTypeDto.code} already exists for this property`,
      );
    }

    return this.prisma.roomType.create({
      data: {
        ...createRoomTypeDto,
        baseRate: createRoomTypeDto.baseRate,
        maxAdults: createRoomTypeDto.maxAdults || 2,
        maxChildren: createRoomTypeDto.maxChildren || 1,
        amenities: createRoomTypeDto.amenities || [],
      },
      include: {
        property: true,
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });
  }

  async findAll(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};
    return this.prisma.roomType.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
      include: {
        property: true,
        rooms: {
          include: {
            _count: {
              select: {
                reservations: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
            rates: true,
          },
        },
      },
    });

    if (!roomType) {
      throw new NotFoundException(`Room type with ID ${id} not found`);
    }

    return roomType;
  }

  async update(id: string, updateRoomTypeDto: UpdateRoomTypeDto) {
    const existingRoomType = await this.prisma.roomType.findUnique({
      where: { id },
    });
    if (!existingRoomType) {
      throw new NotFoundException(`Room type with ID ${id} not found`);
    }

    if (updateRoomTypeDto.code) {
      const existing = await this.prisma.roomType.findFirst({
        where: {
          propertyId: existingRoomType.propertyId,
          code: updateRoomTypeDto.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException(
          `Room type with code ${updateRoomTypeDto.code} already exists for this property`,
        );
      }
    }

    return this.prisma.roomType.update({
      where: { id },
      data: updateRoomTypeDto,
      include: {
        property: true,
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const roomType = await this.findOne(id);

    if (roomType._count.rooms > 0) {
      throw new BadRequestException(
        'Cannot delete room type with existing rooms. Please remove or reassign rooms first.',
      );
    }

    return this.prisma.roomType.delete({
      where: { id },
    });
  }
}
