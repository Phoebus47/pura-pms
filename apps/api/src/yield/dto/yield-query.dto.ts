import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class YieldPropertyQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class YieldPaceQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
