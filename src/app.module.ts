import config from './config';
import { CacheModule, Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { CommonsModule } from './modules/commons/commons.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import * as redisStore from 'cache-manager-redis-store';
import { UploadModule } from './modules/upload/upload.module';
import { EmsModule } from './modules/ems/ems.module';
import { BullModule } from '@nestjs/bull';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    UserModule,
    ClientModule,
    CommonsModule,
    WorkshopModule,
    UploadModule,
    EmsModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<IConfig>) => {
        return {
          redis: {
            host: await configService.get('redis.host', { infer: true }),
            port: await configService.get('redis.port', { infer: true }),
          },
        };
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<IConfig>) => {
        const { host, port } = await configService.get('redis');
        return {
          store: redisStore,
          url: `redis://${host}:${port}/0`,
        };
      },
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
