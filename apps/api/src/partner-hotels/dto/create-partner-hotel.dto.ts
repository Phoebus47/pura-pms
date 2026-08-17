import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartnerHotelDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
