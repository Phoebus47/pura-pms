import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class WalkReservationDto {
  @IsString()
  @IsNotEmpty()
  partnerHotelId: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  compensationAmount?: number;

  @IsString()
  @IsOptional()
  compensationNotes?: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  walkedBy: string;
}
