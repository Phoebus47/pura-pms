import {
  IsInt,
  IsNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCardPreauthDto {
  @IsString()
  reservationId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  last4!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  expiryMonth!: number;

  @IsInt()
  @Min(2020)
  expiryYear!: number;

  @IsString()
  @MinLength(1)
  manualRef!: string;

  @IsString()
  createdBy!: string;
}
