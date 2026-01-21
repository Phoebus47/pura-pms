import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { ReservationStatus } from '@pura/database';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  checkIn: string;

  @IsDateString()
  @IsNotEmpty()
  checkOut: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  adults: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  children?: number;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  guestId: string;

  @IsEnum(ReservationStatus)
  @IsOptional()
  status?: ReservationStatus;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  rateCode?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  roomRate: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  specialRequest?: string;
}
