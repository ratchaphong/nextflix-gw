// src/movie/movie.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { MovieDto } from './dto/movie.dto';
import { SearchMovieQueryDto } from './dto/search-movie-query.dto';
import { GetVideosQueryDto } from './dto/get-videos.query.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  private readonly OMDB_API_KEY = process.env.OMDB_API_KEY;
  private readonly OMDB_URL = process.env.OMDB_URL || `https://www.omdbapi.com`;

  async searchMovies(query: SearchMovieQueryDto): Promise<MovieDto[]> {
    if (!query.q?.trim()) {
      throw new BadRequestException('Search query (q) cannot be empty.');
    }

    const { data } = await axios.get(this.OMDB_URL, {
      params: {
        s: query.q,
        apikey: this.OMDB_API_KEY,
      },
    });

    if (data.Response === 'True' && Array.isArray(data.Search)) {
      return data.Search.map((item: any) => ({
        id: item.imdbID,
        title: item.Title,
        year: parseInt(item.Year),
        image: item.Poster,
        ageRating: 'N/A',
        description: 'N/A',
        tags: [],
      }));
    }
    throw new NotFoundException(data.Error || 'No movies found.');
  }

  async getMovieById(imdbID: string): Promise<MovieDto> {
    const { data } = await axios.get(this.OMDB_URL, {
      params: {
        i: imdbID,
        apikey: this.OMDB_API_KEY,
      },
    });

    if (data.Response === 'True') {
      return {
        id: data.imdbID,
        title: data.Title,
        year: parseInt(data.Year),
        image: data.Poster,
        ageRating: data.Rated || 'N/A',
        description: data.Plot || 'No description available.',
        tags: (data.Genre || '').split(',').map((g: string) => g.trim()),
      };
    }
    throw new NotFoundException(data.Error || 'Movie not found.');
  }

  async getRecommendedVideos() {
    const recommended = await this.prisma.movie.findMany({
      where: {
        releaseDate: null,
        deletedAt: null,
        category: {
          equals: [],
        },
      },
      orderBy: {
        releaseDate: 'desc',
      },
    });

    return recommended;
  }

  async getVideosByCategory(dto: GetVideosQueryDto) {
    const {
      title,
      category,
      orderBy = 'title',
      order = 'asc',
      page = 1,
      perPage = 10,
    } = dto;

    const where: Prisma.MovieWhereInput = {
      deletedAt: null,
      ...(title && {
        title: {
          contains: title,
          mode: 'insensitive',
        },
      }),
      ...(category && {
        category: {
          has: category,
        },
      }),
    };

    const sortBy = ['title', 'releaseDate'].includes(orderBy)
      ? orderBy
      : 'title';

    const result = await this.prisma.movie.findMany({
      where,
      orderBy: {
        [sortBy]: order.toLowerCase() === 'desc' ? 'desc' : 'asc',
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const filtered = result.filter((m) => m.category.length > 0);

    const total = filtered.length;
    const totalPage = Math.ceil(total / perPage);

    return {
      data: filtered,
      page,
      perPage,
      total,
      totalPage,
    };
  }

  create(data: CreateMovieDto) {
    return this.prisma.movie.create({ data });
  }
}
