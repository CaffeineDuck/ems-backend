import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../commons/prisma/prisma.service';
import { UserOnboardDto } from './dto/user-onboard.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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

    return user.onBoarded;
  }

  async getProfile(userId: string) {
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

  async onBoard(userId: string, onBoardDto: UserOnboardDto) {
    const { email, ...userMeta } = onBoardDto;

    const existingUser = await this.prismaService.user.findFirst({
      where: {
        id: userId,
        onBoarded: true,
      },
    });

    if (existingUser)
      throw new BadRequestException('User has already onboarded');

    return this.prismaService.user.update({
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
}
