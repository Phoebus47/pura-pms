import { IsString, IsNotEmpty } from 'class-validator';

export class StartAuditDto {
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @IsString()
  @IsNotEmpty()
  businessDate: string; // ISO format
}
