import { IsString, IsDateString, IsOptional } from 'class-validator';

export class CheckAvailabilityDto {
  @IsString()
  propertyId: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsOptional()
  @IsString()
  roomTypeId?: string;
}
