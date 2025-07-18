import { ApiProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  @Expose() // ✅ include ตัวนี้
  message: string;

  @ApiProperty({ example: 'uuid-1234' })
  @Exclude() // ❌ ไม่ให้ส่งออก
  userId: string;

  @ApiProperty({ example: 'jwt.token.here' })
  @Expose() // ✅ include ตัวนี้
  accessToken: string;
}
