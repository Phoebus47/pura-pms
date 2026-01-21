import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

import { Prisma } from '@pura/database';

@Injectable()
export class GuestsService {
  constructor(private prisma: PrismaService) {}

  async create(createGuestDto: CreateGuestDto) {
    return this.prisma.guest.create({
      data: {
        ...createGuestDto,
        dateOfBirth: createGuestDto.dateOfBirth
          ? new Date(createGuestDto.dateOfBirth)
          : null,
        vipLevel: createGuestDto.vipLevel || 0,
        isBlacklist: createGuestDto.isBlacklist || false,
        preferences: createGuestDto.preferences || {},
      },
    });
  }

  async findAll(
    search?: string,
    isBlacklist?: boolean,
    vipLevel?: number,
    limit?: number,
    offset?: number,
  ) {
    const where: Prisma.GuestWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { idNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isBlacklist !== undefined) {
      where.isBlacklist = isBlacklist;
    }

    if (vipLevel !== undefined) {
      where.vipLevel = vipLevel;
    }

    const [guests, total] = await Promise.all([
      this.prisma.guest.findMany({
        where,
        include: {
          _count: {
            select: {
              reservations: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.guest.count({ where }),
    ]);

    return {
      data: guests,
      total,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            room: {
              include: {
                roomType: true,
              },
            },
          },
          orderBy: {
            checkIn: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    if (!guest) {
      throw new NotFoundException(`Guest with ID ${id} not found`);
    }

    return guest;
  }

  async findByEmail(email: string) {
    return this.prisma.guest.findFirst({
      where: { email },
      include: {
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });
  }

  async findByPhone(phone: string) {
    return this.prisma.guest.findFirst({
      where: { phone },
      include: {
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });
  }

  async update(id: string, updateGuestDto: UpdateGuestDto) {
    await this.findOne(id); // Check if exists

    const updateData: Prisma.GuestUpdateInput = { ...updateGuestDto };
    if (updateGuestDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateGuestDto.dateOfBirth);
    }

    return this.prisma.guest.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const guest = await this.findOne(id);

    // Check if guest has reservations
    if (guest._count.reservations > 0) {
      throw new Error(
        'Cannot delete guest with existing reservations. Guest data must be retained for audit purposes.',
      );
    }

    return this.prisma.guest.delete({
      where: { id },
    });
  }

  async getGuestHistory(id: string) {
    const guest = await this.findOne(id);

    const reservations = await this.prisma.reservation.findMany({
      where: { guestId: id },
      include: {
        room: {
          include: {
            roomType: true,
          },
        },
        folios: {
          include: {
            transactions: true,
          },
        },
      },
      orderBy: {
        checkIn: 'desc',
      },
    });

    // Calculate statistics
    const totalNights = reservations.reduce((sum, res) => sum + res.nights, 0);
    const totalRevenue = reservations.reduce(
      (sum, res) => sum + Number(res.totalAmount),
      0,
    );
    const avgRate = reservations.length > 0 ? totalRevenue / totalNights : 0;

    return {
      guest,
      reservations,
      statistics: {
        totalStays: reservations.length,
        totalNights,
        totalRevenue,
        avgRate,
        lastStay: reservations[0]?.checkIn || null,
      },
    };
  }

  async updateVipLevel(id: string, vipLevel: number) {
    await this.findOne(id);
    return this.prisma.guest.update({
      where: { id },
      data: { vipLevel },
    });
  }

  async toggleBlacklist(id: string) {
    const guest = await this.findOne(id);
    return this.prisma.guest.update({
      where: { id },
      data: { isBlacklist: !guest.isBlacklist },
    });
  }
}
