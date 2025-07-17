// src/movie/dto/video-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class VideoItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  thumbnail: string;

  @ApiProperty()
  video: string;

  @ApiProperty()
  description: string;
}
