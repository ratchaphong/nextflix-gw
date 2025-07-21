import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateLoginLogDto {
  @ApiProperty({
    required: false,
    example: '192.168.1.100',
    description: 'IP address of the client',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    required: false,
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    description: 'User agent string from the client',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
