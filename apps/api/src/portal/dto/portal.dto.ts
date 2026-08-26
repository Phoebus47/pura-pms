import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyGuestQueryDto {
  @IsString()
  @IsNotEmpty()
  lastName!: string;
}

export class CreatePortalMessageDto {
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
