import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PushNotifications, {
  PublishRequest,
} from '@pusher/push-notifications-server';
import * as Notifications from '@pusher/push-notifications-server';

@Injectable()
export class NotificationService {
  beamsClient: PushNotifications;

  constructor(private readonly configService: ConfigService<IConfig>) {
    this.beamsClient = new Notifications({
      instanceId: this.configService.get('pusher.instanceId', { infer: true })!,
      secretKey: this.configService.get('pusher.secretKey', { infer: true })!,
    });
  }

  async sendNotifToUser(userId: string, publishRequest: PublishRequest) {
    return this.beamsClient.publishToUsers([userId], publishRequest);
  }

  generateBeamsToken(userId: string) {
    return this.beamsClient.generateToken(userId);
  }
}
