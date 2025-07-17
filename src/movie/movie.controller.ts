// src/movie/movie.controller.ts
import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import {
  ApiTags,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MovieDto } from './dto/movie.dto';
import { plainToInstance } from 'class-transformer';
import { SearchMovieQueryDto } from './dto/search-movie-query.dto';
import { VideoItemDto } from './dto/video-item.dto';
import { FilterMovieQueryDto } from './dto/filter-movie-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search movies by keyword' })
  @ApiOkResponse({
    description: 'List of movies',
    type: MovieDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Query "q" is required and cannot be empty.',
  })
  async search(@Query() query: SearchMovieQueryDto): Promise<MovieDto[]> {
    const result = await this.movieService.searchMovies(query);
    return plainToInstance(MovieDto, result);
  }

  @Get('filter')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Filter movies by title or genre (from local JSON)',
  })
  @ApiOkResponse({
    description: 'List of matched movies',
    type: VideoItemDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'No or invalid token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  async filterMovies(
    @Query() query: FilterMovieQueryDto,
  ): Promise<VideoItemDto[]> {
    const result = await this.movieService.filterMovies(query);
    return plainToInstance(VideoItemDto, result);
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended videos (mock)' })
  @ApiOkResponse({
    description: 'List of recommended videos',
    type: VideoItemDto,
    isArray: true,
  })
  async getRecommended(): Promise<VideoItemDto[]> {
    const result = await this.movieService.getRecommendedVideos();
    return plainToInstance(VideoItemDto, result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by IMDb ID' })
  @ApiParam({ name: 'id', description: 'IMDb ID', example: 'tt0372784' })
  @ApiOkResponse({ description: 'Movie details', type: MovieDto })
  @ApiNotFoundResponse({ description: 'Movie not found.' })
  async getById(@Param('id') id: string): Promise<MovieDto> {
    const result = this.movieService.getMovieById(id);
    return plainToInstance(MovieDto, result);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get videos by category (mock)' })
  @ApiParam({
    name: 'category',
    example: 'music',
    description: 'Video category',
  })
  @ApiOkResponse({
    description: 'List of videos by category',
    type: VideoItemDto,
    isArray: true,
  })
  async getByCategory(
    @Param('category') category: string,
  ): Promise<VideoItemDto[]> {
    const result = await this.movieService.getVideosByCategory(category);
    return plainToInstance(VideoItemDto, result);
  }
}
