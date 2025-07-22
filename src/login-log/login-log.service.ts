import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLoginLogDto } from './dto/create-login-log.dto';

@Injectable()
export class LoginLogService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateLoginLogDto, userId: string) {
    return this.prisma.loginLog.create({
      data: { ...data, userId: userId },
    });
  }

  findAll() {
    return this.prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }
}
