import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoginLogService } from 'src/login-log/login-log.service';
// import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { THIRTY_DAYS_IN_MS } from 'src/utils/cron.utils';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private loginLogService: LoginLogService,
    // private mailService: MailService,
  ) {
    this.logger.log('✅ CronService initialized');
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup() {
    this.logger.log('🧹 Running daily cleanup...');

    const deleted = await this.prisma.profile.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(Date.now() - THIRTY_DAYS_IN_MS), // เกิน 30 วัน
        },
      },
    });

    this.logger.log(`✅ Cleaned ${deleted.count} soft-deleted profiles.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handlePackageCleanup() {
    this.logger.log('📦 Running subscription package cleanup...');

    const deletedPackages = await this.prisma.subscriptionPackage.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: new Date(Date.now() - THIRTY_DAYS_IN_MS),
        },
      },
    });

    this.logger.log(
      `✅ Cleaned ${deletedPackages.count} soft-deleted packages.`,
    );
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async clearOldLoginLogs() {
    this.logger.log('🧹 Running clead old logs cleanup...');

    const deletedLogs =
      await this.loginLogService.clearOldLogsAndArchive(false);
    await this.loginLogService.sendLoginLogReport();

    this.logger.log(`🧹 Deleted ${deletedLogs} login logs from last month.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async disableExpiredUsers() {
    const now = new Date();
    const expiredUsers = await this.prisma.user.findMany({
      where: {
        packageExpiredAt: {
          lt: now,
        },
      },
    });

    for (const user of expiredUsers) {
      this.logger.log(`🚫 User ${user.email} subscription expired.`);
    }
  }

  //   @Cron('*/15 * * * * *')
  //   async countUsersEvery15Seconds() {
  //     const count = await this.prisma.user.count();
  //     this.logger.log(`👥 Total users: ${count}`);
  //   }
}
