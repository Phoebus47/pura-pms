import { IsOptional, IsString, MinLength } from 'class-validator';

export class IssueTaxInvoiceDto {
  @IsString()
  folioId!: string;

  @IsString()
  @MinLength(1)
  taxId!: string;

  @IsOptional()
  @IsString()
  branchNumber?: string;

  @IsOptional()
  @IsString()
  buyerName?: string;

  @IsString()
  issuedBy!: string;
}
