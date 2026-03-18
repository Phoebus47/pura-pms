import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoliosService } from '../folios/folios.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@pura/database';

type StartAuditResult =
  | {
      readonly status: 'STARTED';
      readonly nightAuditId: string;
      readonly message: string;
    }
  | {
      readonly status: 'ALREADY_COMPLETED' | 'ALREADY_IN_PROGRESS';
      readonly nightAuditId?: string;
      readonly message: string;
    };

@Injectable()
export class NightAuditService {
  private readonly logger = new Logger(NightAuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly foliosService: FoliosService,
    @InjectQueue('night-audit') private readonly nightAuditQueue: Queue,
  ) {}

  async startAudit(
    propertyId: string,
    businessDate: Date,
  ): Promise<StartAuditResult> {
    this.logger.log(
      `Starting Night Audit for property ${propertyId} for date ${businessDate.toISOString()}`,
    );

    // 1. Ensure NightAudit record exists and is not already COMPLETED
    const existingAudit = await this.prisma.nightAudit.findUnique({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
    });

    if (existingAudit?.status === 'COMPLETED') {
      return {
        status: 'ALREADY_COMPLETED',
        message: 'Night audit for this date is already completed',
      };
    }

    if (existingAudit?.status === 'IN_PROGRESS') {
      return {
        status: 'ALREADY_IN_PROGRESS',
        nightAuditId: existingAudit.id,
        message: 'Night audit for this date is already in progress',
      };
    }

    // 2. Create or Update NightAudit record to IN_PROGRESS
    const audit = await this.prisma.nightAudit.upsert({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
      update: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      create: {
        propertyId,
        businessDate,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // 3. Add job to queue (idempotent via deterministic jobId)
    const jobId = `night-audit:${propertyId}:${businessDate.toISOString().slice(0, 10)}`;
    await this.nightAuditQueue.add(
      'process-audit',
      {
        propertyId,
        businessDate: businessDate.toISOString(),
        auditId: audit.id,
      },
      { jobId },
    );

    return {
      status: 'STARTED',
      nightAuditId: audit.id,
      message: 'Night audit job queued',
    };
  }

  async getAuditStatus(propertyId: string, businessDate: Date) {
    const audit = await this.prisma.nightAudit.findUnique({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
      include: {
        errors: true,
        reports: true,
      },
    });

    if (!audit) {
      return { status: 'NOT_STARTED' };
    }

    return audit;
  }

  async processRoomPosting(propertyId: string, businessDate: Date) {
    this.logger.log(
      `Processing Room Posting for ${propertyId} on ${businessDate.toISOString()}`,
    );

    // 1. Find all CHECKED_IN reservations
    const reservations = await this.prisma.reservation.findMany({
      where: {
        status: 'CHECKED_IN',
        room: {
          propertyId,
        },
      },
      include: {
        folios: {
          include: {
            windows: true,
          },
        },
        room: true,
      },
    });

    this.logger.log(
      `Found ${reservations.length} reservations for room posting`,
    );

    let roomsPosted = 0;
    let totalRevenue = 0;

    // Find 'ROOM' transaction code
    const roomTrxCode = await this.prisma.transactionCode.findFirst({
      where: { group: 'ROOM', type: 'CHARGE' },
    });

    if (!roomTrxCode) {
      this.logger.error('ROOM transaction code not found');
      throw new Error('Critical: ROOM transaction code missing');
    }

    // 2. Post room charge for each (with idempotency)
    for (const res of reservations) {
      const folio = res.folios[0]; // Simplified: take first folio
      if (!folio) continue;

      const window = folio.windows.find((w) => w.windowNumber === 1);
      if (!window) continue;

      // Idempotency: check if already posted for this window + businessDate
      const existing = await this.prisma.folioTransaction.findFirst({
        where: {
          windowId: window.id,
          trxCodeId: roomTrxCode.id,
          businessDate: businessDate,
          isVoid: false,
        },
      });

      if (existing) {
        this.logger.warn(
          `Room charge already exists for reservation ${res.id} on ${businessDate.toISOString()}`,
        );
        continue;
      }

      await this.foliosService.postTransaction(folio.id, {
        windowNumber: 1,
        trxCodeId: roomTrxCode.id,
        amountNet: Number(res.roomRate),
        reference: `Night Audit - ${businessDate.toLocaleDateString()}`,
        userId: 'SYSTEM',
        businessDate: businessDate.toISOString(),
      });

      roomsPosted++;
      totalRevenue += Number(res.roomRate);
    }

    // 3. Update audit record with progress
    await this.prisma.nightAudit.update({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
      data: {
        roomsPosted: { increment: roomsPosted },
        revenuePosted: { increment: totalRevenue },
      },
    });

    return { roomsPosted, totalRevenue };
  }

  async generateNightAuditReport(
    propertyId: string,
    nightAuditId: string,
    businessDate: Date,
    summary: Prisma.InputJsonValue,
  ) {
    this.logger.log(
      `Generating Night Audit report for ${propertyId} on ${businessDate.toISOString()}`,
    );

    return this.prisma.reportArchive.create({
      data: {
        propertyId,
        nightAuditId,
        reportType: 'NIGHT_AUDIT_SUMMARY',
        reportName: `Night Audit Summary - ${businessDate.toLocaleDateString()}`,
        businessDate,
        summary,
        data: summary, // Simple for now
        generatedBy: 'SYSTEM',
      },
    });
  }

  async recordAuditError(
    propertyId: string,
    businessDate: Date,
    error: { errorType: string; description: string },
  ) {
    const audit = await this.prisma.nightAudit.findUnique({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
    });

    if (audit) {
      await this.prisma.auditError.create({
        data: {
          nightAuditId: audit.id,
          errorType: error.errorType,
          description: error.description,
        },
      });

      await this.prisma.nightAudit.update({
        where: { id: audit.id },
        data: { status: 'FAILED' },
      });
    }
  }

  async completeAudit(propertyId: string, businessDate: Date) {
    this.logger.log(
      `Completing Night Audit for ${propertyId} on ${businessDate.toISOString()}`,
    );

    await this.prisma.nightAudit.update({
      where: {
        propertyId_businessDate: { propertyId, businessDate },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return this.rollBusinessDate(propertyId);
  }

  async rollBusinessDate(propertyId: string) {
    this.logger.log(`Rolling business date for property ${propertyId}`);

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { businessDate: true },
    });

    if (!property) {
      throw new Error(`Property ${propertyId} not found`);
    }

    const currentDate = new Date(property.businessDate);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    await this.prisma.property.update({
      where: { id: propertyId },
      data: { businessDate: nextDate },
    });

    return nextDate;
  }
}
