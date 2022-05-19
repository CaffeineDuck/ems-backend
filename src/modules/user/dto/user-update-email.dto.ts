import { IsEmail } from 'class-validator';

export class UserUpdateEmailDto {
  @IsEmail()
  email: string;
}
