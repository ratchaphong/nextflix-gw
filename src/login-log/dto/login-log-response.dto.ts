import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class LoginLogResponseDto {
  @Expose()
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'uuid-user-1234' })
  userId: string;

  @Expose()
  @ApiProperty({ example: '192.168.1.1', nullable: true })
  ipAddress?: string;

  @Expose()
  @ApiProperty({ example: 'Mozilla/5.0', nullable: true })
  userAgent?: string;

  @Expose()
  @ApiProperty({ example: '2025-07-20T12:34:56.789Z' })
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.user?.email)
  @ApiProperty({ example: 'user@example.com', nullable: true })
  userEmail?: string;

  @Expose()
  @Transform(({ obj }) => obj.user?.name)
  @ApiProperty({ example: 'John Doe', nullable: true })
  userName?: string;
}
