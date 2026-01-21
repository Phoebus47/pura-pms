import {
  IsString,
  IsOptional,
  IsEmail,
  IsIn,
  IsNotEmpty,
} from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['THB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'])
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
