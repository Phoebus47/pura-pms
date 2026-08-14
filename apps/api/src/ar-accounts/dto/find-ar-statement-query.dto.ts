import { IsDateString, IsOptional, IsString } from 'class-validator';

export class FindArStatementQueryDto {
  @IsOptional()
  @IsDateString()
  asOf?: string;

  @IsOptional()
  @IsString()
  format?: string;
}
