import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('mail delivery', () => {
  it('propagates delivery failure to the caller', async () => {
    const mailer = {
      sendMail: jest.fn().mockRejectedValue(new Error('Mail unavailable')),
    };
    const service = new MailService(mailer as unknown as MailerService);
    await expect(
      service.sendEmail('test@example.com', 'Verify', 'Test'),
    ).rejects.toThrow('Mail unavailable');
  });
});
