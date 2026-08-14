import { IsString, MinLength } from 'class-validator';

export class VoidTaxInvoiceDto {
  @IsString()
  @MinLength(1)
  reason!: string;

  @IsString()
  voidedBy!: string;
}
