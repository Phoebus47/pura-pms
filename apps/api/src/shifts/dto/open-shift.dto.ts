import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class OpenShiftDto {
  @IsString()
  propertyId!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  openingCash!: number;

  @IsOptional()
  @IsDateString()
  businessDate?: string;
}
