import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ToggleFavoriteMovieDto {
  @ApiProperty({
    example: 'QYDza3BLr1w',
    description: 'The ID of the movie to toggle as favorite',
  })
  @IsString()
  movieId: string;
}
