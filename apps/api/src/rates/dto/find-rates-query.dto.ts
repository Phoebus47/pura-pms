import { IsOptional, IsString } from 'class-validator';

export class FindRatesQueryDto {
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  @IsOptional()
  roomTypeId?: string;
}
