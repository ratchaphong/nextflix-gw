// src/login-log/login-log.producer.ts
import {
  Injectable,
  // OnModuleInit
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateLoginLogDto } from './dto/create-login-log.dto';

@Injectable()
export class LoginLogProducer {
  constructor(@InjectQueue('login-log') private readonly queue: Queue) {}

  async addLoginLogJob(userId: string, data: CreateLoginLogDto) {
    await this.queue.add('save-login-log', { userId, ...data });
  }

  async clearLoginLogQueueDirectly() {
    await this.queue.drain(true);
    console.log('✅ Drained waiting, delayed, active jobs.');

    await this.queue.clean(0, 0, 'completed');
    console.log('✅ Cleaned completed jobs.');

    await this.queue.clean(0, 0, 'failed');
    console.log('✅ Cleaned failed jobs.');

    const repeatables = await this.queue.getRepeatableJobs();
    for (const job of repeatables) {
      await this.queue.removeRepeatableByKey(job.key);
      console.log(`✅ Removed repeatable job: ${job.key}`);
    }

    const stuckJobs = await this.queue.getJobs(['paused', 'waiting-children']);
    for (const job of stuckJobs) {
      await job.remove();
      console.log(`✅ Removed stuck job: ${job.id}`);
    }

    console.log('🚀 Queue fully cleared!');
  }
}
