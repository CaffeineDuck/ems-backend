import { Injectable } from '@nestjs/common';
import { UserService } from '../../user.service';
import { OtpService } from './otp.service';

@Injectable()
export class VerifyService {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
  ) {}

  async checkOtpValidatidy(userId: string, otp: number): Promise<boolean> {
    const user = await this.userService.getById(userId);

    if (!user?.password) return false;
    return this.otpService.compareOtp(otp, user.password);
  }

  async verifyEmail(userId: string, otp: number): Promise<boolean> {
    const verified = await this.checkOtpValidatidy(userId, otp);
    if (!verified) {
      return false;
    }

    await this.userService.verifyEmail(userId);
    return true;
  }

  async verifyPhone(userId: string, otp: number): Promise<boolean> {
    const verified = await this.checkOtpValidatidy(userId, otp);
    if (!verified) {
      return false;
    }

    await this.userService.verifyPhone(userId);
    return true;
  }
}
