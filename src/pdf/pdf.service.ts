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

  async generateLoginLogPdf(data: {
    logs: LoginLogResponseDto[];
  }): Promise<Buffer> {
    const templatePath = `${process.cwd()}/src/pdf/templates/login-log.hbs`;
    const html = this.compileTemplate(templatePath, {
      ...data,
      generatedAt: new Date(),
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return Buffer.from(pdfBuffer);
  }

  private compileTemplate(templatePath: string, data: any): string {
    const raw = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(raw);
    return template(data);
  }
}
