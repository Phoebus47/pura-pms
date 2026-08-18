import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateYieldDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;
}
