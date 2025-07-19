import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { VideoItemDto } from './video-item.dto';

export class PaginatedVideoResponseDto {
  @ApiProperty({ type: [VideoItemDto] })
  @Expose()
  @Type(() => VideoItemDto)
  data: VideoItemDto[];

  @ApiProperty()
  @Expose()
  page: number;

  @ApiProperty()
  @Expose()
  perPage: number;

  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  totalPage: number; // ✅ เพิ่มตรงนี้
}
