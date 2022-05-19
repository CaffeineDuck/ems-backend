import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AccessTokenPayload } from '../entities/accessToken.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredRoles)

    if (!requiredRoles) {
      return true;
    }

    const user: AccessTokenPayload = context.switchToHttp().getRequest().user;
    console.log(user.role)
    return requiredRoles.some((role) => user.role === role);
  }
}
