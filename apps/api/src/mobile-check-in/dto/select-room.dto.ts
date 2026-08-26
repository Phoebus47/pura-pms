import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SelectRoomDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
