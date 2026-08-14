import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FindTaxInvoicesQueryDto {
  @IsString()
  propertyId!: string;

  @IsOptional()
  @IsDateString()
  businessDate?: string;
}
