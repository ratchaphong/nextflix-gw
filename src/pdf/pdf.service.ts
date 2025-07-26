import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import { LoginLogResponseDto } from 'src/login-log/dto/login-log-response.dto';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import * as html_to_pdf from 'html-pdf-node';

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
  //   const html = this.compileLoginLogTemplate(templatePath, {
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

  // private compileLoginLogTemplate(templatePath: string, data: any): string {
  //   const raw = fs.readFileSync(templatePath, 'utf8');
  //   const template = Handlebars.compile(raw);
  //   return template(data);
  // }

  async generateLoginLogPdf(data: {
    logs: LoginLogResponseDto[];
  }): Promise<Buffer> {
    const html = this.compileLoginLogTemplate(data);

    const file = { content: html };
    const options = { format: 'A4' };

    const pdfBuffer = await html_to_pdf.generatePdf(file, options);

    return pdfBuffer;
  }

  private compileLoginLogTemplate(data: {
    logs: LoginLogResponseDto[];
  }): string {
    const templateSource = fs.readFileSync(
      `${process.cwd()}/src/pdf/templates/login-log.hbs`,
      'utf8',
    );
    const template = Handlebars.compile(templateSource);
    return template({
      ...data,
      generatedAt: new Date(),
    });
  }
}
