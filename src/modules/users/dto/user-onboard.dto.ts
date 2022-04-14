import { IsEmail, IsString } from 'class-validator';

export class UserOnboardDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;
}
