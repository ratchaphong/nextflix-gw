import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane Updated' })
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsString()
  image: string; // ✅ เพิ่มตรงนี้
}
