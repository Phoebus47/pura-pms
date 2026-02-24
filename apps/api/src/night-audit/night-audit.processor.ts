import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NightAuditService } from './night-audit.service';
import { Logger } from '@nestjs/common';

interface NightAuditJobData {
  propertyId: string;
  businessDate: string;
}

@Processor('night-audit')
export class NightAuditProcessor extends WorkerHost {
  private readonly logger = new Logger(NightAuditProcessor.name);

  constructor(private readonly nightAuditService: NightAuditService) {
    super();
  }

  async process(job: Job<NightAuditJobData>): Promise<{ status: string }> {
    const { propertyId, businessDate } = job.data;

    if (job.name === 'process-audit') {
      this.logger.log(`Processing Night Audit job for property ${propertyId}`);
      await this.nightAuditService.processRoomPosting(
        propertyId,
        new Date(businessDate),
      );
      this.nightAuditService.rollBusinessDate(propertyId);
      this.logger.log(`Night Audit job completed for property ${propertyId}`);
      return { status: 'COMPLETED' };
    }

    throw new Error(`Unknown job name: ${job.name}`);
  }
}
