import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MoveRoomDto {
  @IsString()
  @IsNotEmpty()
  toRoomId: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsNotEmpty()
  movedBy: string;
}
