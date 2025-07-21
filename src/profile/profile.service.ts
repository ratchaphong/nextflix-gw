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
        ...dto,
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

  async toggleFavoriteMovie(
    dto: ToggleFavoriteMovieDto & { profileId: string; userId: string },
  ) {
    const { profileId, userId, movieId } = dto;
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    const favorites = profile.favoriteMovieIds ?? [];
    const updatedFavorites = favorites.includes(movieId)
      ? favorites.filter((id) => id !== movieId)
      : [...favorites, movieId];

    return await this.prisma.profile.update({
      where: { id: profileId },
      data: { favoriteMovieIds: updatedFavorites },
    });
  }

  async getFavoriteMovies(profileId: string, userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { id: profileId, userId, deletedAt: null },
    });
    if (!profile) throw new NotFoundException('Profile not found');

    if (!profile.favoriteMovieIds?.length) return [];

    return await this.prisma.movie.findMany({
      where: {
        id: { in: profile.favoriteMovieIds },
        deletedAt: null,
      },
    });
  }
}
