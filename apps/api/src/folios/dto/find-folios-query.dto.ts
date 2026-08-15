import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FolioStatus } from '@pura/database';

export class FindFoliosQueryDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsEnum(FolioStatus)
  status?: FolioStatus;
}
