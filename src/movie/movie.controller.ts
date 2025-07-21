// src/movie/movie.controller.ts
import {
  Controller,
  Get,
  Query,
  Param,
  Body,
  Post,
  HttpCode,
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
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MovieDto } from './dto/movie.dto';
import { plainToInstance } from 'class-transformer';
import { SearchMovieQueryDto } from './dto/search-movie-query.dto';
import { VideoItemDto } from './dto/video-item.dto';
import { PaginatedVideoResponseDto } from './dto/paginated-video-response.dto';
import { GetVideosQueryDto } from './dto/get-videos.query.dto';
import { CreateMovieDto } from './dto/create-movie.dto';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';

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

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended videos (mock)' })
  @ApiOkResponse({
    description: 'List of recommended videos',
    type: VideoItemDto,
    isArray: true,
  })
  async getRecommended(): Promise<VideoItemDto[]> {
    const result = await this.movieService.getRecommendedVideos();
    return plainToInstance(VideoItemDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('category')
  @ApiOperation({
    summary: 'Get videos (optional category, filters, sort, pagination)',
  })
  @ApiOkResponse({
    description: 'List of videos by category',
    type: PaginatedVideoResponseDto,
    isArray: true,
  })
  async getByCategory(
    @Query() query: GetVideosQueryDto,
  ): Promise<PaginatedVideoResponseDto> {
    const result = this.movieService.getVideosByCategory({
      ...query,
      page: query.page ?? 1,
      perPage: query.perPage ?? 10,
      orderBy: query.orderBy ?? 'title',
      order: query.order ?? 'asc',
    });
    return plainToInstance(PaginatedVideoResponseDto, result, {
      excludeExtraneousValues: true,
    });
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new movie' })
  @ApiCreatedResponse({
    description: 'Create new movie',
    type: VideoItemDto,
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
  async create(@Body() dto: CreateMovieDto) {
    const result = this.movieService.create(dto);
    return plainToInstance(MovieDto, result);
  }
}
