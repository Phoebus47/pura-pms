import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsDecimal,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  baseRate: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxAdults?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxChildren?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
