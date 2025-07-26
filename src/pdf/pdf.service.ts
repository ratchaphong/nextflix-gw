import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { LoginLogResponseDto } from 'src/login-log/dto/login-log-response.dto';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

@Injectable()
export class PdfService {
  constructor() {
    Handlebars.registerHelper('formatDate', function (date: string) {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        console.warn('⚠️ Invalid date in formatDate helper:', date);
        return '-';
      }
      return format(d, 'dd/MM/yyyy HH:mm:ss', { locale: th });
    });
    Handlebars.registerHelper('inc', function (value) {
      return parseInt(value) + 1;
    });
  }

  // async generateLoginLogPdf(data: {
  //   logs: LoginLogResponseDto[];
  // }): Promise<Buffer> {
  //   const templatePath = `${process.cwd()}/src/pdf/templates/login-log.hbs`;
  //   const html = this.compileTemplate(templatePath, {
  //     ...data,
  //     generatedAt: new Date(),
  //   });

  //   const browser = await puppeteer.launch({
  //     headless: true,
  //     args: [],
  //   });
  //   const page = await browser.newPage();
  //   await page.setContent(html, { waitUntil: 'domcontentloaded' });

  //   const pdfBuffer = await page.pdf({ format: 'A4' });
  //   await browser.close();

  //   return Buffer.from(pdfBuffer);
  // }

  // private compileTemplate(templatePath: string, data: any): string {
  //   const raw = fs.readFileSync(templatePath, 'utf8');
  //   const template = Handlebars.compile(raw);
  //   return template(data);
  // }

  async generateLoginLogPdf(data: {
    logs: LoginLogResponseDto[];
  }): Promise<Buffer> {
    const html = this.compileLoginLogTemplate({
      ...data,
      generatedAt: new Date(),
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  private compileLoginLogTemplate(data: {
    logs: LoginLogResponseDto[];
    generatedAt: Date;
  }): string {
    const template = Handlebars.compile(LOGIN_LOG_TEMPLATE);
    return template(data);
  }
}

export const LOGIN_LOG_TEMPLATE = `
  <html>
    <head>
      <style>
        body { font-family: Arial; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h2>📋 Login Report (Daily)</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>User</th>
            <th>Login Time</th>
            <th>Logout Time</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody>
          {{#each logs}}
            <tr>
              <td>{{inc @index}}</td>
              <td>{{this.user.name}}</td>
              <td>{{formatDate this.loginAt}}</td>
              <td>{{formatDate this.logoutAt}}</td>
              <td>{{this.ipAddress}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
      <div style="margin-top: 20px; font-size: 0.85rem;">
        Generated at: {{formatDate generatedAt}}
      </div>
    </body>
  </html>
`;
