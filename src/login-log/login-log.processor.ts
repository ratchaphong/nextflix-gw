// src/login-log/login-log.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';
import { InjectQueue } from '@nestjs/bullmq';

@Processor('login-log')
@Injectable()
export class LoginLogProcessor extends WorkerHost {
  private readonly logger = new Logger(LoginLogProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('login-log') private readonly loginLogQueue: Queue,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'save-login-log':
        await this.handleSaveLoginLog(job);
        break;
      // case 'clear-login-log-queue':
      //   await this.handleClearLoginLogQueue();
      //   break;
      default:
        this.logger.warn(`⚠️ Unknown job received: ${job.name}`);
    }
  }

  private async handleSaveLoginLog(
    job: Job<CreateLoginLogDto & { userId: string }>,
  ) {
    const { userId, ipAddress, userAgent } = job.data;

    await this.prisma.loginLog.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      },
    });

    this.logger.log(`✅ login-log saved for userId ${userId}`);
  }

  // private async handleClearLoginLogQueue() {
  //   await this.loginLogQueue.pause(); // ✅ หยุด worker ชั่วคราว
  //   await this.loginLogQueue.obliterate({ force: true }); // ✅ ล้างคิวทั้งหมด
  //   await this.loginLogQueue.resume(); // ✅ เปิดใช้งานใหม่
  //   this.logger.log('🧹 login-log queue cleared via processor');
  // }
}
