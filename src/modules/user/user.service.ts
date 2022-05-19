import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService, OtpType } from './verify/services/otp.service';
import { PrismaService } from '../commons/prisma/prisma.service';
import { UserVerificationStatus } from './entity/user-verification.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async checkUserOnboarded(userId: string) {
    const existingUser = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        onBoarded: true,
      },
    });

    if (!existingUser) throw new BadRequestException('User has not onboarded');
  }

  async getById(userId: string) {
    return this.prismaService.user.findUnique({ where: { id: userId } });
  }

  async getByPhone(phoneNumber: string) {
    return this.prismaService.user.findUnique({ where: { phoneNumber } });
  }

  async getByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async createByPhone(phoneNumber: string) {
    return this.prismaService.user.create({
      data: { phoneNumber: phoneNumber },
    });
  }

  async updatePassword(userId: string, phoneNumber: string): Promise<void> {
    const otp = await this.otpService.generateOtp();
    const hashedOtp = await this.otpService.hashOtp(otp);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedOtp,
        phoneVerified: false,
      },
    });

    await this.otpService.sendOtp(otp, OtpType.SMS, phoneNumber);
  }

  async updatePhone(userId: string, phoneNumber: string): Promise<void> {
    const otp = await this.otpService.generateOtp();
    const hashedOtp = await this.otpService.hashOtp(otp);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedOtp,
        phoneNumber: phoneNumber,
        phoneVerified: false,
      },
    });

    await this.otpService.sendOtp(otp, OtpType.SMS, phoneNumber);
  }

  async updateEmail(userId: string, email: string): Promise<void> {
    const otp = await this.otpService.generateOtp();
    const hashedOtp = await this.otpService.hashOtp(otp);

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        email: email,
        emailVerified: false,
        password: hashedOtp,
      },
    });

    await this.otpService.sendOtp(otp, OtpType.EMAIL, email);
  }

  async verifyEmail(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: null,
        emailVerified: true,
      },
    });
  }

  async verifyPhone(userId: string): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: null,
        phoneVerified: true,
      },
    });
  }

  async verifyDocuments(userId: string) {
    return this.prismaService.userProfile.update({
      where: {
        userId,
      },
      data: {
        verified: true,
      },
    });
  }

  async getVerificationStatus(
    userId: string,
  ): Promise<UserVerificationStatus | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        onBoarded: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });
  }
}
