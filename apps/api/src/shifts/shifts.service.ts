import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Shift, ShiftStatus } from '@pura/database';
import { PrismaService } from '../prisma/prisma.service';
import { OpenShiftDto } from './dto/open-shift.dto';
import { CloseShiftDto } from './dto/close-shift.dto';
import { ApproveShiftDto } from './dto/approve-shift.dto';
import { HandoverShiftDto } from './dto/handover-shift.dto';
import {
  cashSummaryFromLines,
  computeCashTotals,
  moneyNumber,
  serializeShiftMoney,
  type CashTrxLine,
} from './shift-cash';
import { datesEqualYmd, nextShiftNumber } from './shift-number';
import {
  assertCanApprove,
  assertApproverAllowed,
  assertShiftIsOpen,
  closePayload,
} from './shift-rules';

type ShiftDb = PrismaService | Prisma.TransactionClient;

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async open(dto: OpenShiftDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) {
      throw new NotFoundException(
        `Property with ID ${dto.propertyId} not found`,
      );
    }
    if (
      dto.businessDate &&
      !datesEqualYmd(dto.businessDate, property.businessDate)
    ) {
      throw new BadRequestException(
        'businessDate must match the property current business date',
      );
    }
    await this.assertNoOpenShift(dto.userId);
    const shift = await this.createOpenShift({
      propertyId: property.id,
      userId: dto.userId,
      openingCash: dto.openingCash,
      businessDate: property.businessDate,
    });
    return serializeShiftMoney(shift);
  }

  async findCurrent(propertyId: string, userId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { propertyId, userId, status: ShiftStatus.OPEN },
    });
    if (!shift) {
      throw new NotFoundException('No open shift found');
    }
    return this.withCashSummary(shift);
  }

  async findAll(propertyId: string, businessDate: string) {
    const shifts = await this.prisma.shift.findMany({
      where: {
        propertyId,
        businessDate: new Date(businessDate),
      },
      orderBy: { startTime: 'asc' },
    });
    return shifts.map((row) => serializeShiftMoney(row));
  }

  async findOne(id: string) {
    return this.withCashSummary(await this.requireShift(id));
  }

  async close(id: string, dto: CloseShiftDto) {
    const shift = await this.requireShift(id);
    assertShiftIsOpen(shift.status);
    const closed = await this.persistClose(this.prisma, shift, dto);
    return serializeShiftMoney(closed);
  }

  async approve(id: string, dto: ApproveShiftDto) {
    const shift = await this.requireShift(id);
    assertCanApprove(shift.status);
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      include: { role: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }
    assertApproverAllowed(dto.userId, shift.userId, user.role.permissions);
    const updated = await this.prisma.shift.update({
      where: { id },
      data: {
        managerApprovedBy: dto.userId,
        managerApprovedAt: new Date(),
        status: ShiftStatus.BALANCED,
        notes: dto.notes ?? shift.notes,
      },
    });
    return serializeShiftMoney(updated);
  }

  async handover(id: string, dto: HandoverShiftDto) {
    const current = await this.requireShift(id);
    assertShiftIsOpen(current.status);

    return this.prisma.$transaction(async (tx) => {
      await this.assertNoOpenShift(dto.toUserId, tx);
      const closed = await this.persistClose(tx, current, {
        closingCash: dto.countedCash,
        userId: dto.userId,
        varianceReason: dto.varianceReason,
        notes: dto.notes,
        handoverToUserId: dto.toUserId,
      });
      const successor = await this.createOpenShift(
        {
          propertyId: current.propertyId,
          userId: dto.toUserId,
          openingCash: dto.countedCash,
          businessDate: current.businessDate,
          handoverFromShiftId: current.id,
        },
        tx,
      );
      return {
        closed: serializeShiftMoney(closed),
        opened: serializeShiftMoney(successor),
      };
    });
  }

  private async requireShift(id: string): Promise<Shift> {
    const shift = await this.prisma.shift.findUnique({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  private async assertNoOpenShift(
    userId: string,
    db: ShiftDb = this.prisma,
  ): Promise<void> {
    const existing = await db.shift.findFirst({
      where: { userId, status: ShiftStatus.OPEN },
    });
    if (existing) {
      throw new ConflictException('User already has an open shift');
    }
  }

  private async createOpenShift(
    input: {
      propertyId: string;
      userId: string;
      openingCash: number;
      businessDate: Date;
      handoverFromShiftId?: string;
    },
    db: ShiftDb = this.prisma,
  ): Promise<Shift> {
    const shiftNumber = await nextShiftNumber(
      (prefix) =>
        db.shift.count({
          where: { shiftNumber: { startsWith: prefix } },
        }),
      input.businessDate,
      input.propertyId,
    );
    return db.shift.create({
      data: {
        shiftNumber,
        userId: input.userId,
        propertyId: input.propertyId,
        businessDate: input.businessDate,
        startTime: new Date(),
        openingCash: input.openingCash,
        status: ShiftStatus.OPEN,
        handoverFromShiftId: input.handoverFromShiftId,
      },
    });
  }

  private async persistClose(
    db: ShiftDb,
    shift: Shift,
    dto: CloseShiftDto & { handoverToUserId?: string },
  ): Promise<Shift> {
    const lines = await this.loadCashLines(shift.id, db);
    const expectedCash = computeCashTotals(
      Number(shift.openingCash),
      lines,
    ).expectedCash;
    return db.shift.update({
      where: { id: shift.id },
      data: closePayload(dto.closingCash, expectedCash, dto.userId, {
        varianceReason: dto.varianceReason,
        notes: dto.notes,
        handoverToUserId: dto.handoverToUserId,
      }),
    });
  }

  private async loadCashLines(
    shiftId: string,
    db: ShiftDb = this.prisma,
  ): Promise<CashTrxLine[]> {
    return db.folioTransaction.findMany({
      where: { shiftId },
      include: { trxCode: true },
    });
  }

  private async withCashSummary(shift: Shift) {
    const lines = await this.loadCashLines(shift.id);
    const isOpen = shift.status === ShiftStatus.OPEN;
    const snapshotExpected = moneyNumber(shift.expectedCash);
    const liveExpected = computeCashTotals(
      Number(shift.openingCash),
      lines,
    ).expectedCash;
    return {
      ...serializeShiftMoney(shift),
      expectedCash: isOpen ? liveExpected : snapshotExpected,
      cashVariance: isOpen ? null : moneyNumber(shift.cashVariance),
      cashSummary: cashSummaryFromLines(
        Number(shift.openingCash),
        lines,
        isOpen ? undefined : snapshotExpected,
      ),
    };
  }
}
