import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from 'date-fns';
import { plainToInstance } from 'class-transformer';
import { LoginLogResponseDto } from './dto/login-log-response.dto';
import { PdfService } from 'src/pdf/pdf.service';
import * as fs from 'fs';
import * as path from 'path';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class LoginLogService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private mailService: MailService,
  ) {}

  create(data: CreateLoginLogDto, userId: string) {
    return this.prisma.loginLog.create({
      data: { ...data, userId: userId },
    });
  }

  findAll() {
    return this.prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findMyDailyLogs(userId: string) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return this.prisma.loginLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      // SELECT login_log.*, user.*
      // FROM login_log
      // LEFT JOIN user ON login_log.user_id = user.id
      // ดึง ทั้งหมด จากฝั่งซ้าย (login_log) และข้อมูลจากขวาที่ match เท่านั้น
    });
  }

  findAllDailyLogs() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    return this.prisma.loginLog.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  findMyMonthlyLogs(userId: string) {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return this.prisma.loginLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllMonthlyLogs() {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    return this.prisma.loginLog.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async clearOldLogsAndArchive(isSwagger = true) {
    const firstDayOfCurrentMonth = isSwagger
      ? startOfMonth(addMonths(new Date(), 1))
      : startOfMonth(new Date());
    const firstDayOfLastMonth = subMonths(firstDayOfCurrentMonth, 1);

    const oldLogs = await this.prisma.loginLog.findMany({
      where: {
        createdAt: {
          gte: firstDayOfLastMonth,
          lt: firstDayOfCurrentMonth,
        },
      },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });

    if (oldLogs.length === 0) {
      console.log('✅ No old logs found to archive.');
      return 0;
    }

    const pdfBuffer = await this.pdfService.generateLoginLogPdf({
      logs: plainToInstance(LoginLogResponseDto, oldLogs),
    });

    const archiveDir = path.join(process.cwd(), 'archive');
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir);
    }

    const dateStr = new Date().toISOString().split('T')[0];

    const jsonPath = path.join(archiveDir, `login-log-${dateStr}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(oldLogs, null, 2), 'utf-8');

    const pdfPath = path.join(archiveDir, `login-log-${dateStr}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    if (isSwagger) {
      await this.sendLoginLogReport();
      return oldLogs.length;
    } else {
      const deletedOldLoginLogs = await this.prisma.loginLog.deleteMany({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lt: firstDayOfCurrentMonth,
          },
        },
      });

      console.log(
        `🧹 Deleted ${deletedOldLoginLogs.count} login logs from last month.`,
      );

      return deletedOldLoginLogs.count;
    }
  }

  async sendLoginLogReport() {
    const archiveDir = path.join(process.cwd(), 'archive');
    const today = new Date().toISOString().split('T')[0]; // เช่น 2025-08-01
    const pdfPath = path.join(archiveDir, `login-log-${today}.pdf`);
    const jsonPath = path.join(archiveDir, `login-log-${today}.json`);
    const pdfExists = fs.existsSync(pdfPath);
    const jsonExists = fs.existsSync(jsonPath);
    if (!pdfExists || !jsonExists) {
      console.warn('❌ Missing archived files for email.');
      return;
    }

    // const pdfBuffer = fs.readFileSync(pdfPath);
    const jsonRaw = fs.readFileSync(jsonPath, 'utf-8');
    const jsonObject = JSON.parse(jsonRaw);
    const jsonText = jsonObject
      .map((entry, i) => {
        return `#${i + 1} | ${entry.user?.email ?? 'N/A'} | ${entry.ipAddress} | ${entry.createdAt}`;
      })
      .join('\n');

    try {
      await this.mailService.sendLoginLogReport(
        pdfPath,
        jsonText,
        '📋 Login Log Cleanup Report (Last Month)',
        'Please find attached the login log archive for last month, in both PDF and JSON formats.',
      );
      console.log('📧 Email sent successfully.');
      fs.unlinkSync(pdfPath);
      fs.unlinkSync(jsonPath);
      console.log('🧹 Archived files deleted.');
    } catch (err) {
      console.error('⚠️ Failed to delete archive files:', err);
    }
  }
}
