import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users.module';
import { EmailOtpService } from './services/email.service';
import { OtpService } from './services/otp.service';
import { SmsOtpService } from './services/sms.service';
import { VerifyService } from './services/verify.service';
import { VerificationController } from './verification.controller';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [OtpService, SmsOtpService, EmailOtpService, VerifyService],
  controllers: [VerificationController],
  exports: [OtpService, VerifyService],
})
export class VerificationModule {}
