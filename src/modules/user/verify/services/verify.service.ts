import { Injectable } from '@nestjs/common';
import { OtpService } from './otp.service';

@Injectable()
export class VerifyService {
  constructor(private readonly otpService: OtpService) {}

  async verifyOtp(hashedOtp: string, otp: number): Promise<boolean> {
    return this.otpService.compareOtp(otp, hashedOtp);
  }
}
