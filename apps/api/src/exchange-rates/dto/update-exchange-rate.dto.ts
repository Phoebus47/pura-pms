import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateExchangeRateDto {
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  rate?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
