import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './modules/admin/admin.module';
import { CommonsModule } from './modules/commons/commons.module';
import { ConfigModule } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    AdminModule,
    CommonsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    RouterModule.register([{ path: 'admin', module: AdminModule }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
