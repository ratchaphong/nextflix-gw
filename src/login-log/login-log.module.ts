import { Module } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { LoginLogController } from './login-log.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LoginLogService],
  controllers: [LoginLogController],
  exports: [LoginLogService],
})
export class LoginLogModule {}
