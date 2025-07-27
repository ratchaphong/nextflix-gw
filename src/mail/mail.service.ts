// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendLoginLogReport(
    pdfBuffer: Buffer,
    jsonText: string,
    subject = '📋 Login Log Cleanup Report (Last Month)',
    text = 'Please find attached the login log archive for last month, in both PDF and JSON formats.',
  ) {
    const recipient = this.configService.get<string>('MAIL_TO');
    if (!recipient) {
      throw new Error('MAIL_TO is not defined in the environment variables');
    }
    const today = new Date().toISOString().split('T')[0]; // เช่น 2025-08-01

    await this.mailerService.sendMail({
      to: recipient,
      subject,
      text,
      attachments: [
        {
          filename: `login-log-${today}.pdf`,
          content: pdfBuffer,
        },
        {
          filename: `login-log-${today}.txt`,
          content: jsonText,
          contentType: 'text/plain', // บังคับ MIME type ให้เป็น plain text
        },
      ],
    });
  }
}
