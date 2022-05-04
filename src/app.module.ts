import config from './config';
import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { CommonsModule } from './modules/commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { EmServicesModule } from './modules/em-services/em-services.module';
import { UrgentModule } from './modules/em-services/urgent/urgent.module';
import { WorkshopModule } from './modules/workshop/workshop.module';
import { UserModule } from './modules/user/user.module';
import { ClientModule } from './modules/client/client.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    UserModule,
    ClientModule,
    CommonsModule,
    EmServicesModule,
    WorkshopModule,
    UploadModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    RouterModule.register([
      { path: 'admin', module: AdminModule },
      {
        path: 'service',
        module: EmServicesModule,
        children: [
          {
            path: 'urgent',
            module: UrgentModule,
          },
        ],
      },
    ]),
  ],
})
export class AppModule {}
