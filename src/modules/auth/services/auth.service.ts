import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { OtpFlowDto } from '../dto/otp/flow.dto';
import { VerifyOtpDto } from '../dto/otp/verify.dto';
import { TokensDto } from '../dto/tokens.dto';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
  ) {}

  async authFlow({ phoneNumber }: OtpFlowDto): Promise<string> {
    const otp = await this.otpService.generateOtp();
    const hashedOtp = await this.otpService.hashOtp(otp);

    const user = await this.prismaService.$transaction(
      async (prisma: PrismaClient) => {
        let user = await prisma.user.findUnique({ where: { phoneNumber } });

        if (!user) {
          await prisma.user.create({
            data: { phoneNumber },
          });
        }

        const updatedUser = prisma.user.update({
          where: { phoneNumber },
          data: { password: hashedOtp },
        });

        return updatedUser;
      },
    );

    await this.otpService.sendOtp(otp, user.phoneNumber);
    return user.id;
  }

  async genTokens(user: User) {
    const accessToken = await this.tokenService.genAccessToken(user);
    const refreshToken = await this.tokenService.genRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async verifyOtp({ otp, userId }: VerifyOtpDto): Promise<TokensDto> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new BadRequestException('User not found');
    if (!user.password) throw new BadRequestException('OTP not requested');

    const isValid = await this.otpService.compareOtp(otp, user.password);
    if (!isValid) throw new UnauthorizedException('OTP not valid');

    const newUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { password: null },
    });

    const tokens = await this.genTokens(newUser);
    return tokens;
  }

  async refreshToken(refreshToken: string) {
    const refreshTokenPayload = await this.tokenService.decodeRefreshToken(
      refreshToken,
    );
    const user = await this.prismaService.user.findUnique({
      where: { id: refreshTokenPayload.userId },
    });

    if (!user) throw new BadRequestException('User not found');
    if (user.tokenVersion != refreshTokenPayload.version)
      throw new UnauthorizedException('Token version mismatch');

    const tokens = await this.genTokens(user);
    return tokens;
  }
}
