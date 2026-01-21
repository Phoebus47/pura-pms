import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
} from 'class-validator';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  idType?: string;

  @IsString()
  @IsOptional()
  idNumber?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  vipLevel?: number;

  @IsBoolean()
  @IsOptional()
  isBlacklist?: boolean;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  preferences?: Record<string, any>;
}
