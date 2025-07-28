// src/login-log/login-log.module.ts
import { Module } from '@nestjs/common';
import { LoginLogService } from './login-log.service';
import { LoginLogController } from './login-log.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PdfModule } from 'src/pdf/pdf.module';
import { MailService } from 'src/mail/mail.service';

// ✅ เพิ่ม BullMQ + BullBoard
// import { BullModule } from '@nestjs/bullmq';
// import { BullBoardModule } from '@bull-board/nestjs';
// import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

// ✅ เพิ่ม Producer และ Processor
// import { LoginLogProducer } from './login-log.producer';
// import { LoginLogProcessor } from './login-log.processor';

@Module({
  imports: [
    PrismaModule,
    PdfModule,
    // ✅ Register Queue สำหรับ login-log
    // BullModule.registerQueue({
    //   name: 'login-log',
    // }),
    // ✅ เชื่อม Queue นี้เข้ากับ Bull Board UI
    // BullBoardModule.forFeature({
    //   name: 'login-log',
    //   adapter: BullMQAdapter,
    // }),
  ],
  providers: [
    LoginLogService,
    MailService,
    // LoginLogProducer, // ✅ Producer สำหรับ queue
    // LoginLogProcessor, // ✅ Processor สำหรับ consume งาน
  ],
  controllers: [LoginLogController],
  exports: [LoginLogService],
})
export class LoginLogModule {}
