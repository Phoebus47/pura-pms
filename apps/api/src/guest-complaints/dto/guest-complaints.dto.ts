import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindGuestComplaintsQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CreateGuestComplaintDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  guestId?: string;

  @IsOptional()
  @IsString()
  reservationId?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  openedBy!: string;
}

export class StartGuestComplaintDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

export class ResolveGuestComplaintDto {
  @IsString()
  @IsNotEmpty()
  resolvedBy!: string;

  @IsString()
  @IsNotEmpty()
  resolutionNote!: string;
}

export class CloseGuestComplaintDto {
  @IsString()
  @IsNotEmpty()
  closedBy!: string;
}
