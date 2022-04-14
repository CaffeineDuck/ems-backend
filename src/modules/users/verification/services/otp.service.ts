import { Injectable } from '@nestjs/common';
import { SmsOtpService } from './sms.service';
import { EmailOtpService } from './email.service';
import * as bcrypt from 'bcrypt';

export enum OtpType {
  SMS = 0,
  EMAIL = 1,
}

@Injectable()
export class OtpService {
  constructor(
    private readonly smsOtpService: SmsOtpService,
    private readonly emailOtpService: EmailOtpService,
  ) {}

  async generateOtp(length: number = 6): Promise<number> {
    return Math.floor(Math.random() * Math.pow(10, length));
  }

  async hashOtp(otp: number): Promise<string> {
    return bcrypt.hash(otp.toString(), 10);
  }

  async compareOtp(otp: number, hash: string): Promise<boolean> {
    return bcrypt.compare(otp.toString(), hash);
  }

  async sendOtp(otp: number, otpType: OtpType, to: string): Promise<boolean> {
    console.log(`OTP for ${to} is ${otp}`);
    switch (otpType) {
      case OtpType.SMS:
        return this.smsOtpService.sendOtp(to, otp.toString());
      case OtpType.EMAIL:
        return this.emailOtpService.sendOtp(to, otp.toString());
    }
  }
}
