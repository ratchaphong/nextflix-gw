// movie/dto/create-movie.dto.ts
import {
  IsString,
  IsArray,
  IsOptional,
  IsUrl,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    example: '三浦大知 (Daichi Miura) / Polytope -Conceptual Film-',
    description: 'ชื่อภาพยนตร์',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'https://img.youtube.com/vi/QYDza3BLr1w/hqdefault.jpg',
    description: 'URL ของภาพ thumbnail',
  })
  @IsUrl()
  thumbnail: string;

  @ApiProperty({
    example: 'https://www.youtube.com/embed/QYDza3BLr1w?autoplay=1',
    description: 'URL ของวิดีโอ',
  })
  @IsUrl()
  video: string;

  @ApiProperty({
    example: 'New Single「Horizon Dreamer / Polytope」2025.06.25 Release.',
    description: 'คำอธิบายของภาพยนตร์',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['music', 'conceptual'],
    description: 'หมวดหมู่ของภาพยนตร์',
    required: false,
  })
  @IsArray()
  @IsOptional()
  category?: string[];

  @ApiProperty({
    example: '2025-06-25T00:00:00.000Z',
    description: 'วันเผยแพร่ (ISO string)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  releaseDate?: Date;
}
