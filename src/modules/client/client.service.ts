import { Injectable } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { PrismaService } from '../commons/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    return this.prismaService.userProfile.findUnique({ where: { userId } });
  }

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<UserProfile | null> {
    const updateUser = this.prismaService.user.update({
      where: { id: userId },
      data: { onBoarded: true },
    });

    const createProfile = this.prismaService.userProfile.create({
      data: {
        ...createProfileDto,
        user: { connect: { id: userId } },
      },
    });

    const [_, profile] = await this.prismaService.$transaction([
      updateUser,
      createProfile,
    ]);

    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfile | null> {
    return this.prismaService.userProfile.update({
      where: { userId },
      data: updateProfileDto,
    });
  }
}
