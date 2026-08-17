import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerHotelDto } from './dto/create-partner-hotel.dto';
import { UpdatePartnerHotelDto } from './dto/update-partner-hotel.dto';

@Injectable()
export class PartnerHotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePartnerHotelDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }

    try {
      return await this.prisma.partnerHotel.create({
        data: {
          propertyId: dto.propertyId,
          name: dto.name,
          address: dto.address,
          phone: dto.phone,
          contactPerson: dto.contactPerson,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (err: unknown) {
      this.throwIfUniqueConflict(err, dto.name);
      throw err;
    }
  }

  async findAll(propertyId?: string) {
    return this.prisma.partnerHotel.findMany({
      where: propertyId ? { propertyId } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const partnerHotel = await this.prisma.partnerHotel.findUnique({
      where: { id },
    });
    if (!partnerHotel) {
      throw new NotFoundException(`Partner hotel with ID ${id} not found`);
    }
    return partnerHotel;
  }

  async update(id: string, dto: UpdatePartnerHotelDto) {
    await this.findOne(id);

    try {
      return await this.prisma.partnerHotel.update({
        where: { id },
        data: {
          name: dto.name,
          address: dto.address,
          phone: dto.phone,
          contactPerson: dto.contactPerson,
          isActive: dto.isActive,
        },
      });
    } catch (err: unknown) {
      this.throwIfUniqueConflict(err, dto.name);
      throw err;
    }
  }

  private throwIfUniqueConflict(err: unknown, name?: string) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      throw new BadRequestException(
        `Partner hotel with name ${name} already exists for this property`,
      );
    }
  }
}
