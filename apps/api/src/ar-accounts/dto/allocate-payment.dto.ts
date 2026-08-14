import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class AllocatePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MinLength(1)
  method!: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsString()
  paidBy!: string;

  @IsDateString()
  businessDate!: string;
}
