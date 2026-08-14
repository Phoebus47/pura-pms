import { IsDateString, IsOptional, IsString, Length } from 'class-validator';

export class FindExchangeRatesQueryDto {
  @IsOptional()
  @IsString()
  @Length(3, 3)
  baseCurrency?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  targetCurrency?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
