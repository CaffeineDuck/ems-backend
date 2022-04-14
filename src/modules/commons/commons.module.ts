import { Global, Module } from '@nestjs/common';
import { EmistriLogger } from './logger/logger.service';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  providers: [EmistriLogger, PrismaService],
  exports: [EmistriLogger, PrismaService],
})
export class CommonsModule {}
