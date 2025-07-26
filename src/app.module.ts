import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { MovieModule } from './movie/movie.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CronService } from './cron/cron.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LoginLogModule } from './login-log/login-log.module';
import { CacheService } from './cache/cache.service';
import { CACHE_TTL_SECONDS } from './utils/auth.utils';
import { CacheModule } from '@nestjs/cache-manager';
import { PdfModule } from './pdf/pdf.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        ttl: CACHE_TTL_SECONDS,
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    MovieModule,
    ProfileModule,
    SubscriptionModule,
    PrismaModule,
    LoginLogModule,
    PdfModule,
  ],
  providers: [CronService, CacheService],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
