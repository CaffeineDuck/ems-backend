import { IsNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsNumber()
  otp: number;

  @IsString()
  userId: string;
}
