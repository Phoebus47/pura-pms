import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DIGITAL_KEY_TRANSPORTS, type DigitalKeyTransport } from '../dk-rules';

export class IssueDigitalKeyDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;

  @IsString()
  @IsNotEmpty()
  issuedBy!: string;

  @IsIn(DIGITAL_KEY_TRANSPORTS)
  @IsOptional()
  transport?: DigitalKeyTransport;
}

export class IssueDigitalKeyByConfirmNumberDto {
  @IsString()
  @IsNotEmpty()
  confirmNumber!: string;

  @IsString()
  @IsNotEmpty()
  issuedBy!: string;

  @IsIn(DIGITAL_KEY_TRANSPORTS)
  @IsOptional()
  transport?: DigitalKeyTransport;
}

export class RevokeDigitalKeyDto {
  @IsString()
  @IsNotEmpty()
  revokedBy!: string;

  @IsString()
  @IsOptional()
  revokedReason?: string;
}

export class FindDigitalKeysQueryDto {
  @IsString()
  @IsOptional()
  propertyId?: string;

  @IsString()
  @IsOptional()
  reservationId?: string;
}
