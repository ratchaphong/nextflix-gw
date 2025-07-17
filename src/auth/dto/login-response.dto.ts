import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ example: 'uuid-1234' })
  userId: string;

  @ApiProperty({ example: 'jwt.token.here' })
  accessToken: string;
}
