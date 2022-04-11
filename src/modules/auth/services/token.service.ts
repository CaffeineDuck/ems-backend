import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AccessTokenPayload } from '../entities/accessToken.entity';
import { RefreshTokenPayload } from '../entities/refreshToken.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<IConfig>,
  ) {}

  async genAccessToken(user: User): Promise<string> {
    const payload = { userId: user.id, role: user.role } as AccessTokenPayload;
    return this.jwtService.signAsync(payload);
  }

  async genRefreshToken(user: User) {
    const payload = {
      userId: user.id,
      version: user.tokenVersion,
    } as RefreshTokenPayload;
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get('jwt.refreshExpiresIn', {
        infer: true,
      }),
    });
  }

  async decodeRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(token);
  }
}
