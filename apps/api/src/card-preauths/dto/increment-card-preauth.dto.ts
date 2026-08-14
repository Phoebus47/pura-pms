import { IsNumber, Min } from 'class-validator';

export class IncrementCardPreauthDto {
  @IsNumber()
  @Min(0.01)
  amount!: number;
}
