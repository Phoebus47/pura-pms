import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindTm30ReportsQueryDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsString()
  @IsIn(['PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED'])
  status?: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['true', 'false'])
  overdue?: string;
}

export class GenerateTm30ReportsDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  generatedBy!: string;

  @IsOptional()
  @IsDateString()
  arrivalDate?: string;
}

export class SubmitTm30ReportDto {
  @IsString()
  @IsNotEmpty()
  submittedBy!: string;

  @IsOptional()
  @IsString()
  referenceNo?: string;
}

export class ConfirmTm30ReportDto {
  @IsOptional()
  @IsString()
  referenceNo?: string;
}

export class FailTm30ReportDto {
  @IsString()
  @IsNotEmpty()
  failureReason!: string;
}
