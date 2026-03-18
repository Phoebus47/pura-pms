import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
  IsNumber,
  Min,
} from 'class-validator';
import { TransactionType, TrxGroup } from '@pura/database';

export class CreateTransactionCodeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  descriptionTh?: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsEnum(TrxGroup)
  group!: TrxGroup;

  @IsBoolean()
  hasTax!: boolean;

  @IsBoolean()
  hasService!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxId?: string;

  @ValidateIf((o: CreateTransactionCodeDto) => o.hasService === true)
  @IsNumber()
  @Min(0)
  serviceRate?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  glAccountCode!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  departmentCode?: string;
}
