import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: {
        ...createPropertyDto,
        currency: createPropertyDto.currency || 'THB',
        timezone: createPropertyDto.timezone || 'Asia/Bangkok',
      },
      include: {
        roomTypes: true,
        rooms: true,
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.property.findMany({
      include: {
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        roomTypes: {
          include: {
            _count: {
              select: {
                rooms: true,
              },
            },
          },
        },
        rooms: {
          include: {
            roomType: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    await this.findOne(id);

    return this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
      include: {
        _count: {
          select: {
            rooms: true,
            roomTypes: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const property = await this.findOne(id);

    if (property._count.rooms > 0 || property._count.roomTypes > 0) {
      throw new BadRequestException(
        'Cannot delete property with existing rooms or room types. Please remove them first.',
      );
    }

    return this.prisma.property.delete({ where: { id } });
  }
}
