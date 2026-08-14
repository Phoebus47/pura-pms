import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CheckoutFolioDto {
  @IsString()
  userId!: string;
}

export class SetCreditLimitDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number | null;
}
