import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInspectionDto } from './dto/housekeeping.dto';
import {
  createInspection,
  getBoard,
  getChecklist,
  listInspections,
  markRoomClean,
} from './hk-ops';

@Injectable()
export class HousekeepingService {
  constructor(private readonly prisma: PrismaService) {}

  board(propertyId?: string) {
    return getBoard(this.prisma, propertyId);
  }

  checklist() {
    return getChecklist();
  }

  markClean(roomId: string) {
    return markRoomClean(this.prisma, roomId);
  }

  inspections(roomId: string) {
    return listInspections(this.prisma, roomId);
  }

  inspect(roomId: string, dto: CreateInspectionDto) {
    return createInspection(this.prisma, roomId, dto);
  }
}
