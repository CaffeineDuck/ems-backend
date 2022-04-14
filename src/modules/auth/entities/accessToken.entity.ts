import { Role } from '@prisma/client';

export class AccessTokenPayload {
  userId: string;
  role: Role;
}
