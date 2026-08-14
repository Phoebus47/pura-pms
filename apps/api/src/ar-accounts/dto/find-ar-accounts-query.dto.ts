import { IsOptional, IsString } from 'class-validator';

export class FindArAccountsQueryDto {
  @IsString()
  propertyId!: string;

  @IsOptional()
  @IsString()
  asOf?: string;
}
