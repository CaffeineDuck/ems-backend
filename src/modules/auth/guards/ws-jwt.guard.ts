import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EmistriLogger } from 'src/modules/commons/logger/logger.service';
import { AccessTokenPayload } from '../entities/accessToken.entity';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly logger: EmistriLogger,
    private readonly configService: ConfigService<IConfig>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake?.headers?.authorization as string;
      const user = jwt.verify(
        authToken.split(' ')[1],
        this.configService.get('jwt.secret', { infer: true })!,
      ) as AccessTokenPayload;
      context.switchToWs().getClient().user = user;
      return Boolean(user);
    } catch (err) {
      throw new WsException(err.message);
    }
  }
}
