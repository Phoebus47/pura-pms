import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class PostTransactionDto {
  @IsInt()
  windowNumber: number;

  @IsString()
  trxCodeId: string;

  @IsNumber()
  amountNet: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  reasonCodeId?: string;

  @IsDateString()
  businessDate: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  foreignAmount?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
