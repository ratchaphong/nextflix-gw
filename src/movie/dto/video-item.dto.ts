// src/movie/dto/video-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class VideoItemDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  thumbnail: string;

  @ApiProperty()
  @Expose()
  video: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  releaseDate: string;

  @ApiProperty()
  @Expose()
  category: string[];
}
