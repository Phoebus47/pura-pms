import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsDateString,
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
}
