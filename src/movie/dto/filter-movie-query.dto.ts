// src/movie/dto/filter-movie-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterMovieQueryDto {
  @ApiPropertyOptional({
    description: 'Search by title (partial match)',
    example: 'inception',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Search by genre (exact or partial)',
    example: 'Action',
  })
  @IsOptional()
  @IsString()
  genre?: string;
}
