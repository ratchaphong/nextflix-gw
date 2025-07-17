import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ เปิดใช้งาน CORS แบบ allow all
  app.enableCors({
    origin: '*', // หรือจะระบุ origin เช่น 'http://localhost:3000'
    credentials: true,
  });

  // เพิ่ม limit ของ body (default: 100kb)
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // ✅ เปิดใช้งาน class-validator ทั่วทั้งแอป
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // ลบ field ที่ไม่มีใน DTO อัตโนมัติ
      forbidNonWhitelisted: false, // ถ้า true จะ throw error เลย
      transform: true, // แปลง query param ให้ตรงกับ type
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Movie API')
    .setDescription('Backend APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
