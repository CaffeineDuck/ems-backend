import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpService, OtpType } from './verification/services/otp.service';
import { PrismaService } from '../commons/prisma/prisma.service';
import { UserOnboardDto } from './dto/user-onboard.dto';
import { UserProfile } from './entity/user-profile.entity';

@Injectable()
export class UsersService {
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

  async isVerified(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        onBoarded: true,
        phoneVerified: true,
        emailVerified: true,
        userProfile: {
          select: {
            verified: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException('User not found');

    return user;
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

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        phoneNumber: true,
        userProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async onBoard(userId: string, onBoardDto: UserOnboardDto): Promise<void> {
    const { email, ...userMeta } = onBoardDto;
    const user = await this.getById(userId);

    if (user?.onBoarded)
      throw new BadRequestException('User has already onBoarded');

    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        email: email,
        onBoarded: true,
        userProfile: {
          create: userMeta,
        },
      },
    });
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
}
