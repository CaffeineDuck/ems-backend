import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

@Injectable()
export class SmsOtpService {
  constructor(
    @InjectTwilio() private twilioClient: TwilioClient,
    private readonly configService: ConfigService,
  ) {}

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    // TODO: Handle the case of twilio not being able to send message
    console.log(otp);
    await this.twilioClient.messages.create({
      body: `Your OTP for E-Mistri is ${otp}`,
      to: '+977' + phoneNumber,
      from: this.configService.get('twilio.fromNumber', { infer: true }),
    });
    return true;
  }
}
