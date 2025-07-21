import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { THIRTY_DAYS_IN_MS } from 'src/utils/cron.utils';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private prisma: PrismaService) {
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

    const cutoff = new Date(Date.now() - THIRTY_DAYS_IN_MS);
    const deletedOldLoginLogs = await this.prisma.loginLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    this.logger.log(
      `🧹 Deleted ${deletedOldLoginLogs.count} login logs older than 30 days.`,
    );
  }

  //   @Cron('*/15 * * * * *')
  //   async countUsersEvery15Seconds() {
  //     const count = await this.prisma.user.count();
  //     this.logger.log(`👥 Total users: ${count}`);
  //   }
}
