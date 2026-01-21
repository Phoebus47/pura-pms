import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
} from 'class-validator';
import { RoomStatus } from '@pura/database';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  floor?: number;

  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatus;

  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @IsString()
  @IsNotEmpty()
  propertyId: string;
}
