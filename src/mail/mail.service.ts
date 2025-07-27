// src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { SMTPClient } from 'emailjs';

@Injectable()
export class MailService {
  private readonly client: SMTPClient;

  constructor(
    // private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.client = new SMTPClient({
      user: this.configService.get('SMTP_USER'),
      password: this.configService.get('SMTP_PASS'),
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      tls: true,
    });
  }

  // async sendLoginLogReport(
  //   pdfBuffer: Buffer,
  //   jsonText: string,
  //   subject = '📋 Login Log Cleanup Report (Last Month)',
  //   text = 'Please find attached the login log archive for last month, in both PDF and JSON formats.',
  // ) {
  //   const recipient = this.configService.get<string>('MAIL_TO');
  //   if (!recipient) {
  //     throw new Error('MAIL_TO is not defined in the environment variables');
  //   }
  //   const today = new Date().toISOString().split('T')[0]; // เช่น 2025-08-01
  //   await this.mailerService.sendMail({
  //     to: recipient,
  //     subject,
  //     text,
  //     attachments: [
  //       {
  //         filename: `login-log-${today}.pdf`,
  //         content: pdfBuffer,
  //       },
  //       {
  //         filename: `login-log-${today}.txt`,
  //         content: jsonText,
  //         contentType: 'text/plain', // บังคับ MIME type ให้เป็น plain text
  //       },
  //     ],
  //   });
  // }

  // async sendLoginLogReport(
  //   pdfPath: string,
  //   jsonText: string,
  //   subject = '📋 Login Log Cleanup Report (Last Month)',
  //   text = 'Please find attached the login log archive for last month, in both PDF and JSON formats.',
  // ) {
  //   const today = new Date().toISOString().split('T')[0];

  //   const sender = `${this.configService.get<string>(
  //     'MAIL_FROM',
  //   )} <${this.configService.get<string>('SMTP_USER')}>`;
  //   const recipient = this.configService.get<string>('MAIL_TO');

  //   if (!sender || !recipient) {
  //     throw new Error(
  //       'MAIL_FROM or MAIL_TO is missing in environment variables',
  //     );
  //   }

  //   const message = {
  //     text,
  //     from: sender,
  //     to: recipient,
  //     subject,
  //     attachment: [
  //       {
  //         path: pdfPath,
  //         name: `login-log-${today}.pdf`,
  //         type: 'application/pdf',
  //       },
  //       {
  //         data: jsonText,
  //         name: `login-log-${today}.txt`,
  //         type: 'text/plain',
  //         encoding: 'utf-8',
  //       },
  //     ],
  //   };

  //   await this.client.sendAsync(message);
  // }
}
