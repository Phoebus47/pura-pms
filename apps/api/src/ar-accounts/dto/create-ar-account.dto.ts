import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateArAccountDto {
  @IsString()
  propertyId!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  accountNumber?: string;

  @IsString()
  @MinLength(1)
  companyName!: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  paymentTerms?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
