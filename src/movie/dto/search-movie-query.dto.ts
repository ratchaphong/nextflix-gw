import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SearchMovieQueryDto {
  @ApiProperty({ description: 'Search keyword', example: 'batman' })
  @IsString()
  @IsNotEmpty({ message: 'Query "q" must not be empty.' })
  q: string;
}
