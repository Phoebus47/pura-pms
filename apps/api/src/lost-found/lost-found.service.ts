import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import {
  ClaimLostFoundItemDto,
  CreateLostFoundItemDto,
  DisposeLostFoundItemDto,
  FindLostFoundQueryDto,
  ReturnLostFoundItemDto,
} from './dto/lost-found.dto';
import {
  assertCanClaim,
  assertCanDispose,
  assertCanReturn,
  DEFAULT_RETENTION_DAYS,
  isRetentionOverdue,
  LF_MISSING_PROPERTY,
} from './lost-found-rules';

const itemInclude = {
  guest: { select: { id: true, firstName: true, lastName: true } },
  property: { select: { id: true, name: true } },
} satisfies Prisma.LostFoundItemInclude;

@Injectable()
export class LostFoundService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FindLostFoundQueryDto) {
    if (!query.propertyId) {
      throw new BadRequestException(LF_MISSING_PROPERTY);
    }
    const rows = await this.prisma.lostFoundItem.findMany({
      where: {
        propertyId: query.propertyId,
        ...(query.status
          ? {
              status: query.status as
                | 'FOUND'
                | 'CLAIMED'
                | 'RETURNED'
                | 'DISPOSED',
            }
          : {}),
      },
      include: itemInclude,
      orderBy: [{ foundAt: 'desc' }],
    });
    if (query.overdue !== 'true') return rows;
    return rows.filter((row) =>
      isRetentionOverdue(row.status, row.foundAt, row.retentionDays),
    );
  }

  async findOne(id: string) {
    const row = await this.prisma.lostFoundItem.findUnique({
      where: { id },
      include: itemInclude,
    });
    if (!row) {
      throw new NotFoundException(
        `Lost-and-found item with ID ${id} not found`,
      );
    }
    return row;
  }

  private async ensureGuestExists(guestId?: string) {
    if (!guestId) return;
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
    });
    if (!guest) {
      throw new NotFoundException(`Guest with ID ${guestId} not found`);
    }
  }

  async create(dto: CreateLostFoundItemDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    await this.ensureGuestExists(dto.guestId);
    const foundAt = dto.foundAt ? new Date(dto.foundAt) : new Date();
    if (Number.isNaN(foundAt.getTime())) {
      throw new BadRequestException('foundAt must be a valid date');
    }
    return this.prisma.lostFoundItem.create({
      data: {
        propertyId: dto.propertyId,
        itemDescription: dto.itemDescription.trim(),
        locationFound: dto.locationFound.trim(),
        foundBy: dto.foundBy,
        foundAt,
        roomNumber: dto.roomNumber?.trim() || null,
        notes: dto.notes?.trim() || null,
        guestId: dto.guestId || null,
        retentionDays: dto.retentionDays ?? DEFAULT_RETENTION_DAYS,
      },
      include: itemInclude,
    });
  }

  async claim(id: string, dto: ClaimLostFoundItemDto) {
    const row = await this.findOne(id);
    assertCanClaim(row.status);
    await this.ensureGuestExists(dto.guestId);
    return this.prisma.lostFoundItem.update({
      where: { id },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date(),
        claimedBy: dto.claimedBy,
        guestId: dto.guestId || row.guestId,
      },
      include: itemInclude,
    });
  }

  async returnItem(id: string, dto: ReturnLostFoundItemDto) {
    const row = await this.findOne(id);
    assertCanReturn(row.status);
    return this.prisma.lostFoundItem.update({
      where: { id },
      data: {
        status: 'RETURNED',
        returnedAt: new Date(),
        returnedTo: dto.returnedTo.trim(),
      },
      include: itemInclude,
    });
  }

  async dispose(id: string, dto: DisposeLostFoundItemDto) {
    const row = await this.findOne(id);
    assertCanDispose(row.status);
    return this.prisma.lostFoundItem.update({
      where: { id },
      data: {
        status: 'DISPOSED',
        disposedAt: new Date(),
        disposedBy: dto.disposedBy,
        disposeReason: dto.disposeReason.trim(),
      },
      include: itemInclude,
    });
  }
}
