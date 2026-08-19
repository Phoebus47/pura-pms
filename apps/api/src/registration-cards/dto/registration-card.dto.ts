import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRegistrationCardDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;
}

export class FindRegistrationCardsQueryDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;
}

export class SignRegistrationCardDto {
  @IsString()
  @IsNotEmpty()
  signatureData!: string;

  @IsString()
  @IsNotEmpty()
  signedByGuestName!: string;
}

export class VoidRegistrationCardDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsNotEmpty()
  voidedBy!: string;
}

export class CreatePrintJobDto {
  @IsString()
  @IsNotEmpty()
  requestedBy!: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
