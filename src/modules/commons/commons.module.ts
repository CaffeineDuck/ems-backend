import { Global, Module } from '@nestjs/common';
import { EmistriLogger } from './logger/logger.service';
import { NotificationService } from './notification/notification.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [EmistriLogger, PrismaService, NotificationService],
  exports: [EmistriLogger, PrismaService, NotificationService],
})
export class CommonsModule {}
