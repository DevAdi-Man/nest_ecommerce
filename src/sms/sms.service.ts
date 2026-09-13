import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendSms(to: string, message: string): Promise<void> {
    const isMock = this.configService.get<string>('SMS_PROVIDER') === 'mock';

    if (isMock || !this.configService.get('SMS_PROVIDER')) {
      // Mock SMS Delivery
      this.logger.log('='.repeat(50));
      this.logger.log(`📱 MOCK SMS DISPATCHED`);
      this.logger.log(`To:   ${to}`);
      this.logger.log(`Text: ${message}`);
      this.logger.log('='.repeat(50));
    } else {
      // Future integration with Twilio/AWS SNS etc.
      this.logger.log(`Sending real SMS to ${to}...`);
      // Real SMS logic goes here
    }
  }
}
