import { IsNumber, IsOptional, IsString } from 'class-validator';

export class HandoverShiftDto {
  @IsString()
  toUserId!: string;

  @IsNumber()
  countedCash!: number;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  varianceReason?: string;
}
