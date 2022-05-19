import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailOtpService {
  async sendOtp(email: string, otp: string): Promise<boolean> {
    console.log(`Sending OTP to ${email}: ${otp}`);
    return true;
  }
}
