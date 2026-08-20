import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FindGuestFeedbackQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateGuestFeedbackDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  guestId!: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class ReviewGuestFeedbackDto {
  @IsString()
  @IsNotEmpty()
  reviewedBy!: string;
}
