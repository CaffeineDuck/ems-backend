import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from 'src/modules/auth/entities/accessToken.entity';

export const UserId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    let request: any;
    if (ctx.getType() === 'http') {
      request = ctx.switchToHttp().getRequest();
    } else if (ctx.getType() === 'ws') {
      request = ctx.switchToWs().getClient();
    }
    const user: AccessTokenPayload = request.user;
    return user.userId;
  },
);
