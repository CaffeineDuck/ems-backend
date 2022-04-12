import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { CommonsModule } from './modules/commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import config from './config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AdminModule,
    AuthModule,
    UsersModule,
    CommonsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    RouterModule.register([{ path: 'admin', module: AdminModule }]),
  ],
})
export class AppModule {}
