import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import {
  JOURNAL_SOURCE_MANUAL,
  JOURNAL_SOURCE_NIGHT_AUDIT,
} from '../journal-lines';

export class PostJournalsDto {
  @IsString()
  propertyId!: string;

  @IsDateString()
  businessDate!: string;

  @IsOptional()
  @IsIn([JOURNAL_SOURCE_MANUAL, JOURNAL_SOURCE_NIGHT_AUDIT])
  source?: string;

  @IsOptional()
  @IsString()
  postedBy?: string;
}
