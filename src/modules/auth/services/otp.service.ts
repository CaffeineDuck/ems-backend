import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
  async generateOtp(length: number = 6): Promise<number> {
    return Math.floor(Math.random() * Math.pow(10, length));
  }

  async hashOtp(otp: number): Promise<string> {
    return bcrypt.hash(otp.toString(), 10);
  }

  async compareOtp(otp: number, hash: string): Promise<boolean> {
    return bcrypt.compare(otp.toString(), hash);
  }

  async sendOtp(otp: number, phone: string): Promise<boolean> {
    console.log(otp, phone);
    return true;
  }
}
