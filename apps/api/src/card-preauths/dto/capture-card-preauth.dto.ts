import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CaptureCardPreauthDto {
  @IsString()
  folioId!: string;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;
}
