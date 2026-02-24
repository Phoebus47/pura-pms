import { IsString, IsEnum, IsOptional } from 'class-validator';
import { FolioType } from '@pura/database';

export class CreateFolioDto {
  @IsString()
  reservationId: string;

  @IsEnum(FolioType)
  @IsOptional()
  type?: FolioType;
}
