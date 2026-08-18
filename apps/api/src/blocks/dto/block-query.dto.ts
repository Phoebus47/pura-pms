import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FindBlocksQueryDto {
  @IsString()
  @IsOptional()
  propertyId?: string;
}

export class AttachReservationDto {
  @IsString()
  @IsNotEmpty()
  reservationId!: string;
}
