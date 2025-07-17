import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    const count = await this.prisma.profile.count({
      where: {
        userId,
        deletedAt: null,
      },
    });

    if (count >= 4) {
      throw new BadRequestException('Cannot create more than 4 profiles');
    }

    return this.prisma.profile.create({
      data: {
        name: dto.name,
        userId,
      },
    });
  }

  async updateProfile(
    profileId: string,
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const profile = await this.prisma.profile.findFirst({
      where: {
        id: profileId,
        userId,
        deletedAt: null,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id: profileId },
      data: dto,
    });
  }

  async deleteProfile(profileId: string, userId: string) {
    const profiles = await this.prisma.profile.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    if (profiles.length <= 1 || profiles[0].id === profileId) {
      throw new BadRequestException('Cannot delete the first profile');
    }

    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) throw new NotFoundException('Profile not found');

    return this.prisma.profile.update({
      where: { id: profileId },
      data: { deletedAt: new Date() },
    });
  }
}
