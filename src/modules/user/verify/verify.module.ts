import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { UserModule } from '../user.module';
import { EmailOtpService } from './services/email.service';
import { OtpService } from './services/otp.service';
import { SmsOtpService } from './services/sms.service';
import { VerifyService } from './services/verify.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    TwilioModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        accountSid: configService.get('twilio.accountSid', { infer: true }),
        authToken: configService.get('twilio.authToken', { infer: true }),
      }),
    }),
  ],
  providers: [OtpService, SmsOtpService, EmailOtpService, VerifyService],
  exports: [OtpService, VerifyService],
})
export class VerifyModule {}
