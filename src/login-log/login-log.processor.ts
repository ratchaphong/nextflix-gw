// src/login-log/login-log.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';

@Processor('login-log')
@Injectable()
export class LoginLogProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'save-login-log') {
      const data: CreateLoginLogDto & {
        userId: string;
      } = job.data;
      const { userId, ipAddress, userAgent } = data;

      await this.prisma.loginLog.create({
        data: {
          userId,
          ipAddress,
          userAgent,
          createdAt: new Date(),
        },
      });

      console.log(`✅ Background: login-log saved for userId ${userId}`);
    }
  }
}
