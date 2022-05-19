import config from './config';
import { CacheModule, Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { CommonsModule } from './modules/commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import { UploadModule } from './modules/upload/upload.module';
import { EmsModule } from './modules/ems/ems.module';
import { BullModule } from '@nestjs/bull';

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
    BullModule.forRoot({
      redis: {
        port: 6379,
        host: 'localhost',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CacheModule.register(),
  ],
})
export class AppModule {}
