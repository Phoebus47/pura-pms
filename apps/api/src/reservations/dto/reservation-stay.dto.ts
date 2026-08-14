import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ReservationStayInputDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  roomRate: number;

  @IsString()
  @IsOptional()
  rateCode?: string;
}
