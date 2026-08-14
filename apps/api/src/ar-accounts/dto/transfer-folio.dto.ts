import { IsOptional, IsString } from 'class-validator';

export class TransferFolioDto {
  @IsString()
  folioId!: string;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
