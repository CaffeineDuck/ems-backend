import { IsInt } from 'class-validator';

export class VerifyOtpDto {
  @IsInt()
  otp: number;
}
