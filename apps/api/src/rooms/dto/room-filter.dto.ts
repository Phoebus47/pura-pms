import { IsOptional, IsString, IsEnum } from 'class-validator';
import { RoomStatus } from '@pura/database';

export class RoomFilterDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  roomTypeId?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}
