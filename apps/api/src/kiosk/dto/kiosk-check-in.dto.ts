import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class KioskCheckInDto {
  @IsString()
  @IsNotEmpty()
  confirmNumber!: string;

  @IsOptional()
  @IsString()
  propertyId?: string;
}
