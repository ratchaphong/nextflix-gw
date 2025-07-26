import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class LoginLogService {
  constructor(private prisma: PrismaService) {}

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
}
