import { IsPhoneNumber } from 'class-validator';

export class UserUpdatePhoneDto {
  @IsPhoneNumber('NP')
  phone: string;
}
