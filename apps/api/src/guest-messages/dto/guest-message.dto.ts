import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindGuestMessagesQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsOptional()
  @IsString()
  unread?: string;
}

export class CreateGuestMessageDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsString()
  @IsIn(['INBOUND', 'OUTBOUND'])
  direction!: 'INBOUND' | 'OUTBOUND';

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsString()
  sentBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['IN_APP'])
  channel?: 'IN_APP';
}
