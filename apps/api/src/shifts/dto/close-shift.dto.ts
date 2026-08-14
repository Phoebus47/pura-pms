import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CloseShiftDto {
  @IsNumber()
  closingCash!: number;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  varianceReason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
