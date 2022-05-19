import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';
import { VerifyService } from 'src/modules/user/verify/services/verify.service';
import { OtpFlowDto } from '../dto/otp/flow.dto';
import { VerifyOtpDto } from '../dto/otp/verify.dto';
import { Tokens } from '../entities/tokens.entity';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UserService,
    private readonly verifyService: VerifyService,
  ) {}

  async authFlow({ phoneNumber }: OtpFlowDto): Promise<string> {
    let user = await this.usersService.getByPhone(phoneNumber);
    if (!user) {
      user = await this.usersService.createByPhone(phoneNumber);
    }
    await this.usersService.updatePassword(user.id, phoneNumber);
    return user.id;
  }

  async genTokens(user: User) {
    const accessToken = await this.tokenService.genAccessToken(user);
    const refreshToken = await this.tokenService.genRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async verifyOtp({ otp, userId }: VerifyOtpDto): Promise<Tokens> {
    const user = await this.usersService.getById(userId);
    // Check for user existance and otp request
    if (!user) throw new NotFoundException('User not found');
    if (!user.password)
      throw new ForbiddenException('User not hasnot requested otp');

    // OTP verification
    const verified = await this.verifyService.verifyOtp(user.password, otp);
    if (!verified) throw new UnauthorizedException('Invalid OTP');
    await this.usersService.verifyPhone(userId);

    // Return the tokens
    const tokens = await this.genTokens(user);
    return tokens;
  }

  async refreshToken(refreshToken: string) {
    const refreshTokenPayload = await this.tokenService.decodeRefreshToken(
      refreshToken,
    );

    const user = await this.usersService.getById(refreshTokenPayload.userId);
    if (!user) throw new NotFoundException('User not found');
    if (user.tokenVersion != refreshTokenPayload.version)
      throw new ForbiddenException('Token version mismatch');

    const tokens = await this.genTokens(user);
    return tokens;
  }
}
