import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { OtpService } from './services/otp.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './services/token.service';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1h' },
    }),
    TwilioModule.forRoot({
      accountSid: '',
      authToken: '',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, TokenService],
})
export class AuthModule {}
