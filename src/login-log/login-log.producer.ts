// src/login-log/login-log.producer.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateLoginLogDto } from './dto/create-login-log.dto';

@Injectable()
export class LoginLogProducer {
  constructor(@InjectQueue('login-log') private readonly queue: Queue) {}

  // async onModuleInit() {
  //   await this.addMonthlyCleanupJob();
  // }

  // async addMonthlyCleanupJob() {
  //   try {
  //     await this.queue.add(
  //       'monthly-cleanup',
  //       {},
  //       {
  //         repeat: {
  //           pattern: '0 0 1 * *', // ทุกวันที่ 1 เวลา 00:00
  //         },
  //         jobId: 'monthly-cleanup',
  //         removeOnComplete: true,
  //         removeOnFail: true,
  //       },
  //     );
  //     console.log('🗓️ Monthly cleanup job scheduled.');
  //   } catch (err) {
  //     if (err?.message?.includes('already exists')) {
  //       console.log('🔁 Monthly cleanup job already scheduled, skipping.');
  //     } else {
  //       throw err;
  //     }
  //   }
  // }

  async addLoginLogJob(userId: string, data: CreateLoginLogDto) {
    await this.queue.add('save-login-log', { userId, ...data });
  }
}
