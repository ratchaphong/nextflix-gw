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
import { MOCK_RECOMMENDED_VIDEO, MOCKUP_FILTER_MOVIES } from './movie.utils';
import { FilterMovieQueryDto } from './dto/filter-movie-query.dto';

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

  async getVideosByCategory(category: string): Promise<VideoItemDto[]> {
    console.log('🔧 Using MOCK getVideosByCategory for:', category);
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_RECOMMENDED_VIDEO), 300),
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
