import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  BLOCK_INVENTORY_MODES,
  BLOCK_KINDS,
  type BlockInventoryMode,
  type BlockKind,
} from '../block-rules';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsString()
  @IsNotEmpty()
  roomTypeId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsIn(BLOCK_KINDS)
  kind!: BlockKind;

  @IsIn(BLOCK_INVENTORY_MODES)
  @IsOptional()
  inventoryMode?: BlockInventoryMode;

  @IsString()
  @IsOptional()
  channel?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsDateString()
  cutoffDate!: string;

  @IsInt()
  @Min(1)
  allottedRooms!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
