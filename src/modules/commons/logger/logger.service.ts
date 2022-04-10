import { ConsoleLogger, Injectable } from '@nestjs/common';
import axios from 'axios';

const WEBHOOK_URL =
  'https://discord.com/api/webhooks/961867900027809842/1NzC5LuBHfpSpGooswxiV_NKGYuM5_FOXb-S4zdgsDkysrLIQamJUveuT-e6DAVPoBsm';

@Injectable()
export class EmistriLogger extends ConsoleLogger {
  private writeMessage(message: any, stack?: string, context?: string) {
    return `
      **Context:** \`${context}\`

      **Message:**
      \`\`\`
      ${message}
      \`\`\`

      **Stack:**
      \`\`\`
      ${stack}
      \`\`\`

      **TimeStamp:**
      \`\`\`
      ${new Date().toISOString()}
      \`\`\`
    `;
  }

  async error(message: any, trace?: string, context?: string) {
    axios.post(WEBHOOK_URL, {
      embeds: [
        {
          title: 'Error',
          description: this.writeMessage(message, trace, context),
          color: 16711680,
        },
      ],
    });

    return super.error(message, trace, context);
  }
}
