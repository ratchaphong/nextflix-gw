import { Module } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CronService } from './cron/cron.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoginLogModule } from './login-log/login-log.module';
import { CACHE_TTL_SECONDS } from './utils/auth.utils';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
// import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        url: config.get<string>('REDIS_URL'),
        ttl: config.get<number>('CACHE_TTL_SECONDS') || CACHE_TTL_SECONDS,
      }),
    }),
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (config: ConfigService) => ({
    //     transport: {
    //       host: config.get<string>('SMTP_HOST'),
    //       port: config.get<number>('SMTP_PORT'),
    //       auth: {
    //         user: config.get<string>('SMTP_USER'),
    //         pass: config.get<string>('SMTP_PASS'),
    //       },
    //     },
    //     defaults: {
    //       from: config.get<string>('MAIL_FROM'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    // BullMQ: ตั้งค่า Redis Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT') || 6379,
        },
      }),
    }),
    // BullBoard UI: Dashboard ที่ /queues
    // BullBoardModule.forRoot({
    //   route: '/queues',
    //   adapter: ExpressAdapter,
    // }),
    ScheduleModule.forRoot(),
    AuthModule,
    MovieModule,
    ProfileModule,
    SubscriptionModule,
    PrismaModule,
    LoginLogModule,
  ],
  providers: [CronService],
})
export class AppModule {}
