import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserVerificationStatus } from '../../entity/user-verification.entity';
import { UsersService } from '../../users.service';
import { OtpService } from './otp.service';

@Injectable()
export class VerifyService {
  constructor(
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
  ) {}

  async checkOtpValidatidy(userId: string, otp: number): Promise<boolean> {
    const user = await this.usersService.getById(userId);

    if (!user!.password) throw new BadRequestException('OTP not requested');
    return this.otpService.compareOtp(otp, user!.password!);
  }

  async getStatus(userId: string): Promise<UserVerificationStatus> {
    return this.usersService.isVerified(userId);
  }

  async verifyEmail(userId: string, otp: number): Promise<void> {
    const verified = await this.checkOtpValidatidy(userId, otp);
    if (!verified) {
      throw new ForbiddenException('Invalid OTP');
    }

    await this.usersService.verifyEmail(userId);
  }

  async verifyPhone(userId: string, otp: number): Promise<void> {
    const verified = await this.checkOtpValidatidy(userId, otp);
    if (!verified) {
      throw new ForbiddenException('Invalid OTP');
    }

    await this.usersService.verifyPhone(userId);
  }
}
