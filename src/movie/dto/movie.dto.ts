// src/movie/dto/movie.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class MovieDto {
  @ApiProperty({ example: 'tt0372784' })
  id: string;

  @ApiProperty({ example: 'Batman Begins' })
  title: string;

  @ApiProperty({ example: 'https://...' })
  image: string;

  @ApiProperty({ example: 'A young Bruce Wayne becomes Batman...' })
  description: string;

  @ApiProperty({ example: ['Action', 'Adventure', 'Drama'], type: [String] })
  tags: string[];

  @ApiProperty({ example: 2005 })
  year: number;

  @ApiProperty({ example: 'PG-13' })
  ageRating: string;
}
