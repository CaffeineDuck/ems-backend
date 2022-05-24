import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AccessTokenPayload } from '../entities/accessToken.entity';
import { TokenService } from '../services/token.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake?.headers?.authorization as string;
      const user = await this.tokenService.decodeToken<AccessTokenPayload>(
        authToken,
      );
      context.switchToWs().getClient().user = user;
      return !!user;
    } catch (err) {
      return false;
    }
  }
}
