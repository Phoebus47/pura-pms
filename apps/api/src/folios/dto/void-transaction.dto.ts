import { IsString, IsOptional } from 'class-validator';

export class VoidTransactionDto {
  @IsString()
  userId: string;

  @IsString()
  reasonCodeId: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
