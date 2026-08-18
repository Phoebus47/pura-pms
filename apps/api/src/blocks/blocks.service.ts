import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachReservationDto } from './dto/block-query.dto';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { createBlock, findBlock, findBlocks, updateBlock } from './block-ops';
import {
  attachReservation,
  detachReservation,
  getPickupReport,
  releaseBlock,
} from './block-pickup';

@Injectable()
export class BlocksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBlockDto) {
    return createBlock(this.prisma, dto);
  }

  findAll(propertyId?: string) {
    return findBlocks(this.prisma, propertyId);
  }

  findOne(id: string) {
    return findBlock(this.prisma, id);
  }

  update(id: string, dto: UpdateBlockDto) {
    return updateBlock(this.prisma, id, dto);
  }

  pickup(id: string) {
    return getPickupReport(this.prisma, id);
  }

  attach(id: string, dto: AttachReservationDto) {
    return attachReservation(this.prisma, id, dto.reservationId);
  }

  detach(id: string, reservationId: string) {
    return detachReservation(this.prisma, id, reservationId);
  }

  release(id: string) {
    return releaseBlock(this.prisma, id);
  }
}
