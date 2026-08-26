import { IsOptional, IsString } from 'class-validator';

export class MobileCheckInDto {
  @IsOptional()
  @IsString()
  lastName?: string;
}
