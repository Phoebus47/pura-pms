import { IsOptional, IsString } from 'class-validator';

export class FindArInvoicesQueryDto {
  @IsString()
  propertyId!: string;

  @IsOptional()
  @IsString()
  arAccountId?: string;
}
