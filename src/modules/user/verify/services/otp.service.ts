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
    if (process.env?.NODE_ENV != 'developement')
      return Math.floor(Math.random() * Math.pow(10, length));

    return 123456;
  }

  async hashOtp(otp: number): Promise<string> {
    return bcrypt.hash(otp.toString(), 10);
  }

  async compareOtp(otp: number, hash: string): Promise<boolean> {
    return bcrypt.compare(otp.toString(), hash);
  }

  async sendOtp(otp: number, otpType: OtpType, to: string): Promise<boolean> {
    switch (otpType) {
      case OtpType.SMS:
        return this.smsOtpService.sendOtp(to, otp.toString());
      case OtpType.EMAIL:
        return this.emailOtpService.sendOtp(to, otp.toString());
    }
  }
}
