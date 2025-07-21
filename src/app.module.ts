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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    MovieModule,
    ProfileModule,
    SubscriptionModule,
    PrismaModule,
    LoginLogModule,
  ],
  providers: [CronService],
  // controllers: [AppController],
  // providers: [AppService],
})
export class AppModule {}
