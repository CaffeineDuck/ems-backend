import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './services/otp.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service';
import { TwilioModule } from 'nestjs-twilio';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        secret: configService.get('jwt.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn', { infer: true }),
        },
      }),
    }),
    TwilioModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        accountSid: configService.get('twilio.accountSid', { infer: true }),
        authToken: configService.get('twilio.authToken', { infer: true }),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, TokenService],
})
export class AuthModule {}
