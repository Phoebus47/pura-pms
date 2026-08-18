import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  HARDWARE_JOB_STATUSES,
  HARDWARE_JOB_TYPES,
  type HardwareJobStatus,
  type HardwareJobType,
} from '../hb-rules';

export class FindHardwareQueryDto {
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsIn(HARDWARE_JOB_STATUSES)
  @IsOptional()
  status?: HardwareJobStatus;
}

export class RegisterAgentDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  machineId!: string;
}

export class CreateHardwareJobDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsIn(HARDWARE_JOB_TYPES)
  type!: HardwareJobType;

  @IsString()
  @IsNotEmpty()
  requestedBy!: string;

  @IsObject()
  payload!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;

  @IsString()
  @IsOptional()
  reservationId?: string;
}

export class CompleteJobDto {
  @IsObject()
  result!: Record<string, unknown>;
}

export class FailJobDto {
  @IsString()
  @IsNotEmpty()
  errorMessage!: string;
}
