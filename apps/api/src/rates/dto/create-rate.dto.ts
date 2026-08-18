import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { RATE_DERIVE_MODES, type RateDeriveMode } from '../rate-derive';

export class CreateRateDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ValidateIf((dto: CreateRateDto) => !dto.parentRateId)
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  daysOfWeek?: number[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  parentRateId?: string;

  @ValidateIf((dto: CreateRateDto) => Boolean(dto.parentRateId))
  @IsIn(RATE_DERIVE_MODES)
  deriveMode?: RateDeriveMode;

  @ValidateIf((dto: CreateRateDto) => Boolean(dto.parentRateId))
  @IsNumber()
  deriveValue?: number;
}
