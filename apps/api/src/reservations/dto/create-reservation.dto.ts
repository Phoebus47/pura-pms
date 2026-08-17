import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  BillingCycle,
  ReservationStatus,
  StayPurpose,
  TaxExemptReason,
} from '@pura/database';
import { ReservationStayInputDto } from './reservation-stay.dto';

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

  @IsBoolean()
  @IsOptional()
  isDayUse?: boolean;

  @IsEnum(StayPurpose)
  @IsOptional()
  stayPurpose?: StayPurpose;

  @IsString()
  @IsOptional()
  approvedBy?: string;

  @IsString()
  @IsOptional()
  stayPurposeNote?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsEnum(BillingCycle)
  @IsOptional()
  billingCycle?: BillingCycle;

  @IsBoolean()
  @IsOptional()
  taxExempt?: boolean;

  @IsEnum(TaxExemptReason)
  @IsOptional()
  taxExemptReason?: TaxExemptReason;

  @IsString()
  @IsOptional()
  taxExemptDocumentRef?: string;

  @IsString()
  @IsOptional()
  taxExemptApprovedBy?: string;

  @IsBoolean()
  @IsOptional()
  isRoomLocked?: boolean;

  @IsString()
  @IsOptional()
  roomLockNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationStayInputDto)
  stays?: ReservationStayInputDto[];
}
