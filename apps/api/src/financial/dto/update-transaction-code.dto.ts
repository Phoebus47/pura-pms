import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TransactionType, TrxGroup } from '@pura/database';

export class UpdateTransactionCodeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descriptionTh?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TrxGroup)
  group?: TrxGroup;

  @IsOptional()
  @IsBoolean()
  hasTax?: boolean;

  @IsOptional()
  @IsBoolean()
  hasService?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @ValidateIf((o: UpdateTransactionCodeDto) => o.hasService === true)
  @IsNumber()
  @Min(0)
  serviceRate?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  glAccountCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  departmentCode?: string;
}
