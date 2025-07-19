// src/movie/movie.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import { MovieDto } from './dto/movie.dto';
import { SearchMovieQueryDto } from './dto/search-movie-query.dto';
import { VideoItemDto } from './dto/video-item.dto';
import {
  MOCK_RECOMMENDED_VIDEO,
  MOCK_VIDEO_BY_CATEGORY,
  MOCKUP_FILTER_MOVIES,
} from '../utils/movie.utils';
import { FilterMovieQueryDto } from './dto/filter-movie-query.dto';
import { GetVideosQueryDto } from './dto/get-videos.query.dto';
import { PaginatedVideoResponseDto } from './dto/paginated-video-response.dto';

@Injectable()
export class MovieService {
  private readonly OMDB_API_KEY = process.env.OMDB_API_KEY;

  async searchMovies(query: SearchMovieQueryDto): Promise<MovieDto[]> {
    if (!query.q?.trim()) {
      throw new BadRequestException('Search query (q) cannot be empty.');
    }

    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query.q)}&apikey=${this.OMDB_API_KEY}`;
    const { data } = await axios.get(url);

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
    const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${this.OMDB_API_KEY}`;
    const { data } = await axios.get(url);

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

  async getRecommendedVideos(): Promise<VideoItemDto[]> {
    console.log('🔧 Using MOCK getRecommendedVideos');
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_RECOMMENDED_VIDEO), 300),
    );
  }

  async getVideosByCategory(
    dto: GetVideosQueryDto,
  ): Promise<PaginatedVideoResponseDto> {
    console.log('🔧 Using MOCK getVideosByCategory for:', dto);

    let filtered = [...MOCK_VIDEO_BY_CATEGORY];
    if (dto.category) {
      const queryCategory = dto.category.toLowerCase();
      filtered = filtered.filter((item) =>
        item.category.some((cat) => cat.toLowerCase() === queryCategory),
      );
    } else if (dto.title) {
      const queryTitle = dto.title.toLowerCase();
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(queryTitle),
      );
    }

    const validOrderFields = ['title', 'releaseDate'];
    const orderBy =
      dto.orderBy && validOrderFields.includes(dto.orderBy)
        ? dto.orderBy
        : 'title';
    const order = dto.order === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';
      return aValue > bValue ? order : aValue < bValue ? -order : 0;
    });

    const page = dto.page && !isNaN(Number(dto.page)) ? Number(dto.page) : 1;
    const perPage =
      dto.perPage && !isNaN(Number(dto.perPage)) ? Number(dto.perPage) : 10;
    const total = filtered.length;
    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);
    const totalPage = Math.ceil(total / perPage);

    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          data: paginated,
          page,
          perPage,
          total,
          totalPage,
        });
      }, 300),
    );
  }

  async filterMovies(query: FilterMovieQueryDto): Promise<MovieDto[]> {
    const { title } = query;

    const filtered = MOCKUP_FILTER_MOVIES.filter((movie) => {
      const matchesTitle = title
        ? (movie.Title?.toLowerCase().includes(title.toLowerCase()) ?? false)
        : true;

      return matchesTitle;
    });

    const transformed = filtered.map((movie) => ({
      id: movie.Id.toString(),
      title: movie.Title,
      year: movie.Year,
      image:
        'https://via.placeholder.com/300x450?text=' +
        encodeURIComponent(movie.Title),
      description: movie.Description ?? 'No description available.',
      ageRating: 'N/A',
      tags: movie.Genres
        ? (movie.Genres as string).split(',').map((g: string) => g.trim())
        : [],
    }));

    return transformed;
  }
}
