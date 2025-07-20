import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.subscriptionPackage.findMany({
      orderBy: { price: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.subscriptionPackage.findUnique({ where: { id } });
  }

  async getDefaultPackageId(): Promise<string> {
    const basic = await this.prisma.subscriptionPackage.findUnique({
      where: { id: 'basic-id' },
    });

    if (!basic) {
      throw new NotFoundException('Default subscription package not found');
    }

    return basic.id;
  }
}
