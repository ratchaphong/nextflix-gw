import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({ example: 'Registration successful' })
  message: string;

  @ApiProperty({ example: 'uuid-1234' })
  userId: string;
}
