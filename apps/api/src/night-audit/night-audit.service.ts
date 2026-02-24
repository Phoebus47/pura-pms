import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FoliosService } from '../folios/folios.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NightAuditService {
  private readonly logger = new Logger(NightAuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly foliosService: FoliosService,
    @InjectQueue('night-audit') private readonly nightAuditQueue: Queue,
  ) {}

  async startAudit(propertyId: string, businessDate: Date) {
    this.logger.log(
      `Starting Night Audit for property ${propertyId} for date ${businessDate.toISOString()}`,
    );

    // Add job to queue
    await this.nightAuditQueue.add('process-audit', {
      propertyId,
      businessDate,
    });

    return { status: 'STARTED', message: 'Night audit job queued' };
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

    // 2. Post room charge for each
    for (const res of reservations) {
      const folio = res.folios[0]; // Simplified: take first folio
      if (!folio) continue;

      const window = folio.windows.find((w) => w.windowNumber === 1);
      if (!window) continue;

      // Find 'ROOM' transaction code
      const roomTrxCode = await this.prisma.transactionCode.findFirst({
        where: { group: 'ROOM', type: 'CHARGE' },
      });

      if (roomTrxCode) {
        await this.foliosService.postTransaction(folio.id, {
          windowNumber: 1,
          trxCodeId: roomTrxCode.id,
          amountNet: Number(res.roomRate),
          reference: `Night Audit - ${businessDate.toLocaleDateString()}`,
          userId: 'SYSTEM',
          businessDate: businessDate.toISOString(),
        });
      }
    }
  }

  rollBusinessDate(propertyId: string) {
    // Implementation for rolling the business date in property settings
    this.logger.log(`Rolling business date for property ${propertyId}`);
  }
}
