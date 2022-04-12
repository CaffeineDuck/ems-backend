import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';

@Injectable()
export class OtpService {
  constructor(
    @InjectTwilio() private readonly twilioClient: TwilioClient,
    private readonly configService: ConfigService<IConfig>,
  ) {}

  async generateOtp(length: number = 6): Promise<number> {
    return Math.floor(Math.random() * Math.pow(10, length));
  }

  async hashOtp(otp: number): Promise<string> {
    return bcrypt.hash(otp.toString(), 10);
  }

  async compareOtp(otp: number, hash: string): Promise<boolean> {
    return bcrypt.compare(otp.toString(), hash);
  }

  async sendOtp(otp: number, phone: string): Promise<boolean> {
    console.log(`OTP FOR ${phone}: ${otp}`);

    // TODO: Check for API response from twilio.
    await this.twilioClient.messages.create({
      body: `Your OTP for E-Mistri is ${otp}`,
      to: '+977' + phone,
      from: this.configService.get('twilio.fromNumber', { infer: true }),
    });
    return true;
  }
}
