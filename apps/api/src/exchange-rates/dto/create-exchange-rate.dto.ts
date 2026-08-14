import {
  IsDateString,
  IsNumber,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateExchangeRateDto {
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Za-z]{3}$/)
  baseCurrency!: string;

  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Za-z]{3}$/)
  targetCurrency!: string;

  @IsNumber()
  @Min(0.0001)
  rate!: number;

  @IsDateString()
  effectiveDate!: string;
}
