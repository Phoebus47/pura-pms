import { IsOptional, IsString } from 'class-validator';

export class FindCardPreauthsQueryDto {
  @IsOptional()
  @IsString()
  reservationId?: string;
}
