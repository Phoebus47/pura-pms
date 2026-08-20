import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class FindLostFoundQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  overdue?: string;
}

export class CreateLostFoundItemDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  itemDescription!: string;

  @IsString()
  @IsNotEmpty()
  locationFound!: string;

  @IsString()
  @IsNotEmpty()
  foundBy!: string;

  @IsOptional()
  @IsDateString()
  foundAt?: string;

  @IsOptional()
  @IsString()
  roomNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  retentionDays?: number;
}

export class ClaimLostFoundItemDto {
  @IsString()
  @IsNotEmpty()
  claimedBy!: string;

  @IsOptional()
  @IsString()
  guestId?: string;
}

export class ReturnLostFoundItemDto {
  @IsString()
  @IsNotEmpty()
  returnedTo!: string;
}

export class DisposeLostFoundItemDto {
  @IsString()
  @IsNotEmpty()
  disposedBy!: string;

  @IsString()
  @IsNotEmpty()
  disposeReason!: string;
}
