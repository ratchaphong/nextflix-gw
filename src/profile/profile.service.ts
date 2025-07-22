import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ToggleFavoriteMovieDto } from './dto/toggle-favorite.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    // 1. ดึง user พร้อม household (กรณี OWNER) และ member (กรณี MEMBER)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: { members: true },
        },
        member: {
          include: {
            household: {
              include: { members: true },
            },
          },
        },
        subscriptionPackage: true,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // 2. ดึง household จาก user.household
    const household = user.household;
    if (!household) throw new NotFoundException('Household not found');

    const memberIds = household.members.map((m) => m.id);

    // 3. ดึงจำนวนโปรไฟล์ทั้งหมดใน household
    const totalProfiles = await this.prisma.profile.count({
      where: {
        householdMemberId: {
          in: memberIds,
        },
        deletedAt: null,
      },
    });

    const maxProfiles = user.subscriptionPackage?.maxProfiles ?? 4;
    if (totalProfiles >= maxProfiles) {
      throw new BadRequestException('Cannot create more than allowed profiles');
    }

    // 4. สร้าง profile ให้กับ member ที่ตรงกับ user นี้ ถ้ามี
    const matchedMember = household.members.find((m) => m.userId === user.id);
    const defaultMemberId = matchedMember?.id;

    if (!defaultMemberId) {
      throw new BadRequestException('No household member to assign profile');
    }

    const profile = await this.prisma.profile.create({
      data: {
        name: dto.name,
        image: dto.image,
        householdMemberId: defaultMemberId,
      },
    });

    return profile;
  }

  async updateProfile(
    profileId: string,
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: { members: true },
        },
        member: {
          include: {
            household: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const household = user.household ?? user.member?.household;
    if (!household) throw new NotFoundException('Household not found');

    const memberIds = household.members.map((m) => m.id);

    const profile = await this.prisma.profile.findFirst({
      where: {
        id: profileId,
        householdMemberId: { in: memberIds },
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        household: {
          include: { members: true },
        },
        member: {
          include: {
            household: {
              include: { members: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const household = user.household ?? user.member?.household;
    if (!household) throw new NotFoundException('Household not found');

    const memberIds = household.members.map((m) => m.id);

    const profiles = await this.prisma.profile.findMany({
      where: {
        householdMemberId: { in: memberIds },
        deletedAt: null,
      },
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

  // async toggleFavoriteMovie(
  //   dto: ToggleFavoriteMovieDto & { profileId: string; userId: string },
  // ) {
  //   const { profileId, userId, movieId } = dto;
  //   const profile = await this.prisma.profile.findFirst({
  //     where: { id: profileId, userId, deletedAt: null },
  //   });
  //   if (!profile) throw new NotFoundException('Profile not found');

  //   const favorites = profile.favoriteMovieIds ?? [];
  //   const updatedFavorites = favorites.includes(movieId)
  //     ? favorites.filter((id) => id !== movieId)
  //     : [...favorites, movieId];

  //   return await this.prisma.profile.update({
  //     where: { id: profileId },
  //     data: { favoriteMovieIds: updatedFavorites },
  //   });
  // }

  // async getFavoriteMovies(profileId: string, userId: string) {
  //   const profile = await this.prisma.profile.findFirst({
  //     where: { id: profileId, userId, deletedAt: null },
  //   });
  //   if (!profile) throw new NotFoundException('Profile not found');

  //   if (!profile.favoriteMovieIds?.length) return [];

  //   return await this.prisma.movie.findMany({
  //     where: {
  //       id: { in: profile.favoriteMovieIds },
  //       deletedAt: null,
  //     },
  //   });
  // }
}
