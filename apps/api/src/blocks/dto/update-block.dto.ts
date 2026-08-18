import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { BLOCK_STATUSES, type BlockStatus } from '../block-rules';

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsDateString()
  @IsOptional()
  cutoffDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  allottedRooms?: number;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsIn(BLOCK_STATUSES)
  @IsOptional()
  status?: BlockStatus;
}
