import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateWakeUpCallDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsString()
  @IsNotEmpty()
  scheduledBy!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class FindWakeUpCallsQueryDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  reservationId?: string;
}

export class CompleteWakeUpCallDto {
  @IsString()
  @IsNotEmpty()
  completedBy!: string;
}

export class MissWakeUpCallDto {
  @IsString()
  @IsNotEmpty()
  missedBy!: string;
}

export class CancelWakeUpCallDto {
  @IsString()
  @IsNotEmpty()
  cancelledBy!: string;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
