import { IsOptional, IsString } from 'class-validator';

export class ApproveShiftDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
