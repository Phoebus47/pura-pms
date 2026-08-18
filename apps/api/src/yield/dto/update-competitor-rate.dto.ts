import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateCompetitorRateDto {
  @IsString()
  @IsOptional()
  competitorName?: string;

  @IsDateString()
  @IsOptional()
  stayDate?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  roomTypeId?: string | null;

  @IsString()
  @IsOptional()
  notes?: string | null;
}
