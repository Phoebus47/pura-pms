import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class FindHousekeepingQueryDto {
  @IsString()
  @IsOptional()
  propertyId?: string;
}

export class InspectionLineDto {
  @IsString()
  @IsNotEmpty()
  itemCode!: string;

  @IsBoolean()
  passed!: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty()
  inspectedBy!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  lines!: InspectionLineDto[];
}

export class SetGuestRequestDto {
  @IsString()
  @IsIn(['NONE', 'DND', 'MUR'])
  request!: 'NONE' | 'DND' | 'MUR';

  @IsString()
  @IsNotEmpty()
  updatedBy!: string;

  @IsString()
  @IsOptional()
  note?: string;
}
