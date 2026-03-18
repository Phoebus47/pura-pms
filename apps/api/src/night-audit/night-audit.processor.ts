import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NightAuditService } from './night-audit.service';
import { Logger } from '@nestjs/common';

interface NightAuditJobData {
  propertyId: string;
  businessDate: string;
  auditId: string;
}

@Processor('night-audit')
export class NightAuditProcessor extends WorkerHost {
  private readonly logger = new Logger(NightAuditProcessor.name);

  constructor(private readonly nightAuditService: NightAuditService) {
    super();
  }

  async process(job: Job<NightAuditJobData>): Promise<{ status: string }> {
    const { propertyId, businessDate, auditId } = job.data;

    if (job.name === 'process-audit') {
      try {
        this.logger.log(
          `Processing Night Audit job for property ${propertyId} on ${businessDate}`,
        );

        // 1. Mark as started in DB if not already (Service does this on startAudit, but good to be sure)
        // Note: businessDate in job data is ISO string
        const dateObj = new Date(businessDate);

        // 2. Room Posting (Idempotent)
        const { roomsPosted, totalRevenue } =
          await this.nightAuditService.processRoomPosting(propertyId, dateObj);

        // 3. (Optional) Process Fixed Charges - placeholders for now but unblocks WP5
        // await this.nightAuditService.processFixedCharges(propertyId, dateObj);

        // 4. Generate Report Archive
        await this.nightAuditService.generateNightAuditReport(
          propertyId,
          auditId,
          dateObj,
          {
            roomsPosted,
            totalRevenue,
          },
        );

        // 5. Complete Audit and Roll Date
        await this.nightAuditService.completeAudit(propertyId, dateObj);

        this.logger.log(`Night Audit job completed for property ${propertyId}`);
        return { status: 'COMPLETED' };
      } catch (err) {
        this.logger.error(
          `Night Audit failed for property ${propertyId}: ${(err as Error).message}`,
        );

        // Record error in DB
        await this.nightAuditService.recordAuditError(
          propertyId,
          new Date(businessDate),
          {
            errorType: 'PROCESSOR_FAILURE',
            description: (err as Error).message,
          },
        );

        throw err; // Re-throw for BullMQ retry if configured
      }
    }

    throw new Error(`Unknown job name: ${job.name}`);
  }
}
